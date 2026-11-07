<?php
// Tiny Office Live: who is watching, the doorbell, and shared events. State lives in data/state.json.
// GET  api.php?id=abc                returns { now, online, bell, rings, visits, events }
// POST api.php id=abc&action=bell    rings the bell (once per 20 s for everyone, once a minute per visitor)
// POST api.php id=abc&action=lift&f=N calls the lift to floor N (once per 15 s for everyone, once a minute per visitor)
// POST api.php id=abc&action=pizza   orders pizza (once per 10 min for everyone, once per 30 min per visitor)
// POST api.php id=abc&action=party   throws a party (once per 5 min for everyone, once per 20 min per visitor)
// POST api.php id=abc&action=plane&p=ID&x=0..1&y=PX&c=CAM&d=1|-1  throws a paper plane everyone sees (4 per 10 s per visitor)
// POSTs for lift and pizza also return { ok, wait } where wait is the number of seconds until it is allowed again.
// events is a list of { k: 'lift'|'pizza'|'party', at: ms, f } from the last 3 hours.
// planes is a list of { p, at, x, y, c, d } from the last 12 seconds.
header('Content-Type: application/json');
header('Cache-Control: no-store');

$dir = __DIR__ . '/data';
if (!is_dir($dir)) @mkdir($dir, 0755);
$fp = @fopen($dir . '/state.json', 'c+');
$now = (int) round(microtime(true) * 1000);
if (!$fp) { echo json_encode(['now' => $now, 'online' => 1, 'bell' => 0, 'events' => []]); exit; }
flock($fp, LOCK_EX);
$s = json_decode(stream_get_contents($fp) ?: '{}', true);
if (!is_array($s)) $s = [];
$s += ['seen' => [], 'bell' => 0, 'rings' => 0, 'ringers' => [], 'visits' => 0,
       'events' => [], 'lift' => 0, 'pizza' => 0, 'party' => 0, 'lifters' => [], 'pizzers' => [], 'partiers' => [], 'planes' => []];

$id = substr(preg_replace('/[^a-z0-9]/', '', strtolower($_REQUEST['id'] ?? '')), 0, 16);
if ($id !== '') {
  if (!isset($s['seen'][$id])) $s['visits']++;
  $s['seen'][$id] = $now;
}
foreach ($s['seen'] as $k => $v) if ($now - $v > 40000) unset($s['seen'][$k]);
foreach ($s['ringers'] as $k => $v) if ($now - $v > 60000) unset($s['ringers'][$k]);
foreach ($s['lifters'] as $k => $v) if ($now - $v > 60000) unset($s['lifters'][$k]);
foreach ($s['pizzers'] as $k => $v) if ($now - $v > 1800000) unset($s['pizzers'][$k]);
foreach ($s['partiers'] as $k => $v) if ($now - $v > 1200000) unset($s['partiers'][$k]);
$s['planes'] = array_values(array_filter($s['planes'], function ($q) use ($now) { return $now - $q['at'] <= 12000; }));
$s['events'] = array_values(array_filter($s['events'], function ($e) use ($now) { return $now - $e['at'] <= 3 * 3600000; }));

$out = ['now' => $now];
$action = $_POST['action'] ?? '';
// no raw addresses are stored, only a salted hash that is dropped once its limit has passed
$who = hash('sha256', 'tiny-office|' . ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . $id);
if ($action === 'bell') {
  $out['rang'] = $now - $s['bell'] > 20000 && !isset($s['ringers'][$who]);
  if ($out['rang']) { $s['bell'] = $now; $s['rings']++; $s['ringers'][$who] = $now; }
}
// one rate limited event: $last is the global key, $per the per visitor map, limits in ms
function event_try(&$s, &$out, $now, $who, $kind, $last, $per, $gap, $pgap, $extra) {
  $wait = max($gap - ($now - $s[$last]), isset($s[$per][$who]) ? $pgap - ($now - $s[$per][$who]) : 0);
  $out['ok'] = $wait <= 0;
  if ($out['ok']) {
    $s[$last] = $now; $s[$per][$who] = $now;
    $s['events'][] = ['k' => $kind, 'at' => $now] + $extra;
  } else $out['wait'] = (int) ceil($wait / 1000);
}
if ($action === 'lift') {
  $f = (int) ($_POST['f'] ?? -1);
  if ($f < 0 || $f > 40) { $out['ok'] = false; $out['wait'] = 0; }
  else event_try($s, $out, $now, $who, 'lift', 'lift', 'lifters', 15000, 60000, ['f' => $f]);
}
if ($action === 'pizza') event_try($s, $out, $now, $who, 'pizza', 'pizza', 'pizzers', 600000, 1800000, []);
if ($action === 'plane') {
  $mine = 0; foreach ($s['planes'] as $q) if ($q['w'] === substr($who, 0, 12) && $now - $q['at'] < 10000) $mine++;
  $out['ok'] = $mine < 4 && count($s['planes']) < 40;
  if ($out['ok']) $s['planes'][] = ['p' => substr(preg_replace('/[^a-z0-9]/', '', strtolower($_POST['p'] ?? '')), 0, 12), 'w' => substr($who, 0, 12), 'at' => $now,
    'x' => round(min(1, max(0, (float) ($_POST['x'] ?? 0))), 4), 'y' => (int) min(4000, max(-400, (int) ($_POST['y'] ?? 0))),
    'c' => round(min(60, max(-5, (float) ($_POST['c'] ?? 0))), 3), 'd' => ((int) ($_POST['d'] ?? 1)) < 0 ? -1 : 1];
}
if ($action === 'party') event_try($s, $out, $now, $who, 'party', 'party', 'partiers', 300000, 1200000, []);

ftruncate($fp, 0); rewind($fp);
fwrite($fp, json_encode($s));
fflush($fp); flock($fp, LOCK_UN); fclose($fp);

echo json_encode($out + ['online' => max(1, count($s['seen'])), 'bell' => $s['bell'], 'rings' => $s['rings'], 'visits' => $s['visits'], 'events' => $s['events'], 'planes' => array_map(function ($q) { unset($q['w']); return $q; }, $s['planes'])]);
