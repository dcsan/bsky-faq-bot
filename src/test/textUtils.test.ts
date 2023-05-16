import { fixReplacers } from "../utils/textUtils"

describe("text utils", () => {
  test("it should replace [CaseSense] to [casesense]", () => {
    const before = 'This is [CaseSense] based *[] and [AnotherHere]'
    const expected = 'This is [casesense] based *[] and [anotherhere]'
    const after = fixReplacers(before)
    expect(after).toEqual(expected)
  })

})

