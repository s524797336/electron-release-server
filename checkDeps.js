const fs = require('fs')
const path = require('path')
const http = require('http')
const querystring = require('querystring')
const url = require('url')

const packageLockFile = path.resolve(__dirname, './package-lock.json')
const file = fs.readFileSync(packageLockFile)

const postData = querystring.stringify({
    'file': file.toString()
})

if (!process.env.NPM_PROXY_HOST) {
    console.log('no need to check dependencies', process.env.NPM_PROXY_HOST)
    /* eslint-disable-next-line unicorn/no-process-exit */
    process.exit(0)
}

const parse = new url.URL(process.env.NPM_PROXY_HOST)

const postOptions = {
    host: parse.hostname,
    port: parse.port,
    path: '/packageLockTest',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Connection': 'keep-alive'
    }
}

console.log('checking dependencies...')

let total = 0

const postRequest = http.request(postOptions, (response) => {
    response.on('end', () => {
        if (total !== parseInt(response.headers['content-length'])) {
            console.error('check dependencies error')
            /* eslint-disable-next-line unicorn/no-process-exit */
            process.exit(1)
        }
        console.log('check dependencies finish')
        /* eslint-disable-next-line unicorn/no-process-exit */
        process.exit(0)
    })
    response.on('data', (chunk) => {
        total += chunk.length
        console.log(`${total}/${response.headers['content-length']}`)
    })
    response.on('error', () => {
        console.error('check dependencies error')
        /* eslint-disable-next-line unicorn/no-process-exit */
        process.exit(1)
    })
})

// post the data
postRequest.write(postData)
postRequest.end()
