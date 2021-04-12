
export const isStrongPassword = function(password) {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
  return regex.test(password);
}


export const isValidPageFormat = function(pageSelections) {
  const regex = /(-?[1-9][0-9]?,\s){0,4}(-?[1-9][0-9]?){1}/
  const match = pageSelections.match(regex)
  return (match && pageSelections === match[0] ? true : false)
}


export const isUniqueHeaderCellValue = function(value) {
  let count = 0;
  for (let i = 0; i < this.form.headerCells.length; i++) {
    let v = this.form.headerCells[i].value;
    if (v === value) {
      count++;
    }
    if (count > 1) {
      return false
    }
  }
  return true
}


export const areValidDateChars = function(date) {
  if (typeof date === 'string') {
    for (let i = 0; i < date.length; i++) {
      if (!'MDY-/ ,'.includes(date[i])) {
        return false
      }
    }
    return true 
  }
}


export const isDocTemplate = function() {
  return this.templateType === 'doc'
}


export const notEmptyValueOrToday = function(cellSect) {
  return cellSect.searchOrInputMethod && cellSect.searchOrInputMethod !== 'today'
} 











   