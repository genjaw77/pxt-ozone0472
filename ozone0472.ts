
/**
 * Extension OZONE0472
 * Capteur DFRobot SEN0472
 * Micro:bit V2
 */

//% color=#20A5A5 weight=100 icon="\uf043"
namespace Ozone0472 {

    const ADRESSE = 0x74

    let ozone = -1
    let temperature = -999

    /**
     * Initialiser le capteur
     */
    //% block="initialiser le capteur ozone0472"
    //% weight=100
    export function initialiser(): void {
        ozone = -1
        temperature = -999
    }

    /**
     * Lire le capteur et calculer ozone et temperature
     */
    //% block="mesurer ozone et température"
    //% weight=90
    export function mesurer(): void {

        let commande = pins.createBuffer(10)

        commande[0] = 0
        commande[1] = 255
        commande[2] = 1
        commande[3] = 136
        commande[4] = 0
        commande[5] = 0
        commande[6] = 0
        commande[7] = 0
        commande[8] = 0
        commande[9] = 119

        pins.i2cWriteBuffer(ADRESSE, commande, false)

        basic.pause(100)

        pins.i2cWriteNumber(
            ADRESSE,
            0,
            NumberFormat.UInt8BE,
            false
        )

        let reponse = pins.i2cReadBuffer(ADRESSE, 9, false)

        // Vérification de la réponse
        if (reponse[0] != 255 || reponse[1] != 136) {
            ozone = -1
            temperature = -999
            return
        }

        // Vérification du checksum
        let checksum = (256 - (
            reponse[1] +
            reponse[2] +
            reponse[3] +
            reponse[4] +
            reponse[5] +
            reponse[6]
        ) % 256) % 256

        if (checksum != reponse[8] || reponse[4] != 42) {
            ozone = -1
            temperature = -999
            return
        }

        // Calcul de la concentration en ozone
        let brut = reponse[2] * 256 + reponse[3]

        ozone = brut

        if (reponse[5] == 1) {
            ozone = brut / 10
        } else if (reponse[5] == 2) {
            ozone = brut / 100
        }

        // Calcul de la température
        let tempADC = reponse[6] * 256 + reponse[7]

        let tension = tempADC * 3 / 1024

        temperature = -999

        if (tension > 0 && tension < 3) {

            let resistance = tension * 10000 / (3 - tension)

            if (resistance > 0) {

                temperature = 1 / (
                    1 / 298.15 +
                    1 / 3380.13 *
                    Math.log(resistance / 10000)
                ) - 273.15
            }
        }

        if (temperature == -999) {
            ozone = -1
        }
    }

    /**
     * Obtenir la concentration en ozone
     */
    //% block="concentration ozone O3 (ppm)"
    //% weight=80
    export function lireOzone(): number {
        return ozone
    }

    /**
     * Obtenir la température
     */
    //% block="température (°C)"
    //% weight=70
    export function lireTemperature(): number {
        return temperature
    }
}
