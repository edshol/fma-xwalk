export default function decorate(block) {
  // 最初のp要素にrelease_regionクラスを付与
  const firstP = block.querySelector('div > div > p');
  if (firstP) {
    firstP.classList.add('release_region');
  }
}
