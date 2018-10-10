
export class PasswordHelper {

    private static bcrypt = require("bcrypt");

    public static async checkPassword(password, hash): Promise<boolean> {

        if (!hash) {
            return false;
        }

        return new Promise<boolean>((resolve, reject) => {
            PasswordHelper.bcrypt.compare(password, hash, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })
    }

    public static async hashPassword(password): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let saltRounds = 10;
            PasswordHelper.bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(hash);
            });
        })
    }
}