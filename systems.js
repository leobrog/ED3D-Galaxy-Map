
import axios from 'axios'
import { filter, flatten, map } from 'ramda'
import { writeFileSync } from 'fs'

const formatData = (data, factionName) => {

    const systems = map(sys => ({
        name: sys.system_name,
        coords: {
            x: sys.system_details.x + "",
            y: sys.system_details.y + "",
            z: sys.system_details.z + ""
        }
    }))(data)
    return { factionName, systems, count: systems.length }
}

const getControllingSystemsData = async (factionName) => {
    const url = `https://elitebgs.app/api/ebgs/v5/factions?name=${factionName}&minimal=false&systemDetails=true`
    const response = await axios.get(url)
    if (response.data?.docs[0]?.faction_presence) {
        const systemData = filter(x => {
            return factionName === x.system_details.controlling_minor_faction_cased
        })(response.data.docs[0].faction_presence)

        return formatData(systemData, factionName)
    }
    return { factionName, count: 0 }
}

const run = async () => {
    const factions = [
        "People's Party of Heverty",
        "Theta Chamaelontis Citizen Party",
        "Left Party of Guarpulici",
        "United Coalition of Boonta",
        "Chuang Kong Union",
        "Citizen Party of Lopo Vuh",
        "Communist Party of Drakonia",
        "The Coven",
        "Eichwald Kommune",
        "Egovi Union",
        "Guardians of Harmony",
        "ICU Colonial Corps",
        "Industrial Workers of the Way",
        "Interstellar Proletarian Vanguard",
        "Jaroahy Unionists",
        "The Marxist-Leninist Astrology Commission",
        "Movement for Bibrigen Labour Union",
        "Labour Union of Tatji",
        "Nagii Union",
        "Off World Collective",
        "Paladins of Empathy",
        "People's Dictatorships Union",
        "Planetary Democratic Socialists",
        "United Revolutionary Workers' Party",
        "Wild Flower Legion",
        "Union of Kosche",
        "Citizen Party of Dumnon",
        "Worker's Frontier Coalition",
        "Workers of Quillaente Union Party",
        "Citizen Party of Grabil",
        "Citizen Party of Chireni",
        "Union Party of Bungk",
        "United Fintamkina Left Party"
    ]
    const control = await Promise.all(map(fName => getControllingSystemsData(fName))(factions))
    return filter(x => x.count > 0)(control)
}

const systemsData = await run()
//writeFileSync("./systemsData.json", JSON.stringify(systemsData, null, 2))

const colors = [
"bb3dff",
"9a02d6",
"60a309",
"4bed56",
"50ff2d",
"793baf",
"4674a8",
"a02a1b",
"cad82b",
"393bba",
"f96413",
"9a0ef2",
"acd642",
"a110d1",
"d13eb8",
"7ace46",
"e0a664",
"b6f202",
"4ed34a",
"f45ac6",
"bc3014",
"af1c2f",
"0e9e10",
"e207ce",
"0891a9",
"91bef7"
]

const galmapJson = (facData) => {
    let ciFactions = {}
    let systems = []
    facData.forEach((fac, i) => {
        ciFactions[i] = { name: fac.factionName, color: colors[i].toUpperCase() }
        const sys = map(x => ({...x, cat: [i], info: ''}))(fac.systems)
        systems.push(sys)
    })
    return {
        categories : {
            "CI Factions": ciFactions
        },
        systems: flatten(systems)
    }
}

const mapData = galmapJson(systemsData)
writeFileSync("./ciu/mapData.json", JSON.stringify(mapData, null, 2))