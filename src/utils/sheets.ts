/**
 * read data from sheets
 * https://developers.google.com/sheets/api/guides/values#read_multiple_ranges
 */

import path from "path"
import { AppConfig } from "./AppConfig"
import { google } from "googleapis"

const clog = console

async function googleAuth() {
  const keyPath = path.join(__dirname, '../secrets/google-bsky-sa.json')
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  })

  const sheetsApi = google.sheets({ version: 'v4', auth });
  // clog.log('sheetsApi', sheetsApi)
  return sheetsApi

}

async function readValues(tabName: string = 'faqData') {
  const sheetsApi = await googleAuth()
  const query = `${tabName}!A1:G10`
  clog.log('readValues:', query)
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: AppConfig.FAQ_SHEET_ID,
    range: query,
  });

  return res.data.values

  // await sheetApi.spreadsheets.values.append({
  //   spreadsheetId: AppConfig.SHEET_ID,
  //   auth: auth,
  //   range: "Sheet1",
  //   valueInputOption: "RAW",
  //   requestBody: {
  //     values: [["hello", "world"]]
  //   }
  // })
}

async function test() {
  const values = await readValues()
  clog.log('values', JSON.stringify(values, null, 2))
}


export { readValues }
