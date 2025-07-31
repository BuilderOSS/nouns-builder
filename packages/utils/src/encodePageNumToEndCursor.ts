/*

  Encode page number of router.query.page to base64 string for endCursor argument
  - helper for pagination
  - limit defaults to 30 and must be the same as to limit in the graphql query being used

*/
export const encodePageNumToEndCursor = (limit: number, page?: string) => {
  const skip = !page ? 0 : limit * (Number(page) - 1)
  const offset = { skip }
  const str = JSON.stringify(offset)
  return Buffer.from(str, 'ascii').toString('base64')
}
