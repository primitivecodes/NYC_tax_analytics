
function quickselect(arr, k, compareFn) {
  function partition(left, right) {
    const pivot = arr[right];
    let i = left;
    for (let j = left; j < right; j++) {
      if (compareFn(arr[j], pivot) > 0) { 
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
      }
    }
    [arr[i], arr[right]] = [arr[right], arr[i]];
    return i;
  }

  function select(left, right, k) {
    if (left >= right) return;
    const pivotIndex = partition(left, right);
    const count = pivotIndex - left + 1;
    if (k === count) return;
    else if (k < count) select(left, pivotIndex - 1, k);
    else select(pivotIndex + 1, right, k - count);
  }

  select(0, arr.length - 1, k);
  return arr.slice(0, k);
}

module.exports = quickselect;
