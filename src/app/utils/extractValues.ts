function extractValuesFromArrayObjects(array: any[], key: string): any[] {
  return array.map(item => item[key])
}

export default extractValuesFromArrayObjects
