let jwt = require("jsonwebtoken");

export class JWTHelper {
    private static SECRET = process.env.JWT_SECRET;

    public static async verify(token): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            jwt.verify(token, JWTHelper.SECRET, (error, decoded) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(decoded);
            });
        });
    }

    public static sign(payload): string {
        let token = jwt.sign(payload, JWTHelper.SECRET);
        return token;
    }
}