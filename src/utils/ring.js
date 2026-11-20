// Draws the round countdown marker shown above anything that needs help.
// left: 1 = full time left, 0 = time is up.
export function drawTimerRing(g, x, y, left, time) {
  const danger = left < 0.35;
  // In danger the marker pulses so it catches your eye.
  const pulse = danger ? 1 + Math.sin(time * 0.02) * 0.12 : 1;
  const r = 20 * pulse;

  g.clear();
  g.fillStyle(danger ? 0xd62828 : 0x222222, 0.85).fillCircle(x, y, r);
  g.lineStyle(4, danger ? 0xffd23f : 0x7ee081);
  g.beginPath();
  g.arc(x, y, r - 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left, false);
  g.strokePath();
}
