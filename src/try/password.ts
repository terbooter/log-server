import {PasswordHelper} from "../lib/PasswordHelper";


async function main() {
    let hash = await PasswordHelper.hashPassword("123");
    console.log(hash);
}

main();