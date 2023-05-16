const clog = console

export function fixReplacers(line: string) {

  const rexStr = /\[\w*\]/gmi
  const rex = new RegExp(rexStr)
  const matches = line.match(rex)
  clog.log('matches', matches)
  if (!matches) { return line }
  for (let item of matches) {
    const newM = item.toLowerCase()
    line = line.replace(item, newM)
  }

  // line = line.replace(, '\n')
  return line
}
