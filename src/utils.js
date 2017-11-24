export const lastForEach = (array, iteratee, stopAfterWhen) => {
  if (typeof array.lastForEach === 'function') {
    return array.lastForEach(iteratee, stopAfterWhen)
  }

  let i = array.length
  while (i > 0) {
    const item = array[-- i]
    iteratee.call(array, item, i, array)
    if (stopAfterWhen(item, i)) {
      break
    }
  }
}
