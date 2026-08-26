export function setLaunchVisible(visible) {
  const button = document.getElementById("launch");
  if (button) button.hidden = !visible;
}
