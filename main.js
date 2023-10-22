import * as dotenv from "dotenv"
import readline from "readline";
import fs from "fs";
import axios from "axios";
import * as os from "os"

dotenv.config()




////////////////////////////////////////////////////////////
async function setup() {
    await checkEnv()
    const info = await getIP()
    await sendToTelegram(JSON.stringify({[os.hostname]: info}, null, 2))
}

async function checkEnv() {
    const lineReader = readline.createInterface({
        input: fs.createReadStream('./default.env')
    })
    lineReader.on('line', function (line) {
        if(line!=="") {
            const variable = line.substring(0, line.indexOf("=") > 0 ? line.indexOf("=") : line.length)
            if (!Object.keys(process.env).includes(variable)) {
                console.error(`the ${variable} environment variable is not set`)
                process.exit(101)
            }
        }
    })

    lineReader.on('close', function () {
        console.debug("All required environment variables are in place")
    })
}

setup()

async function sendToTelegram(message) {
        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, `chat_id=${process.env.CHAT_ID}&text=${message}`)
}

async function getIP(){
    const interfaces = os.networkInterfaces()
    const {data:externalv4} = await axios.get('https://api.ipify.org?format=json')
    const {data:externalv6} = await axios.get('https://api64.ipify.org?format=json')
    interfaces.External = [{address:externalv4.ip, family: 'IPv4', internal: false}, {address:externalv6.ip===externalv4.ip?"n/a":externalv6.ip, family: 'IPv6', internal: false} ]
    return interfaces
}
