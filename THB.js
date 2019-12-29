const csvtojson = require('csvtojson')

function load_THB_data() {
    return csvtojson().fromFile('THB.csv')
}

function preprocess(data) {
    let ys = []
    Object.keys(data).map((i) => {
        ys.push(Number.parseFloat(data[i]['value']))
    })
    return ys
}

function computeAverage(data) {
    let sum = 0
    data.map(value => {
        sum += value
    })
    return sum / data.length
}

function computeMedian(data) {
    if (data.length % 2 == 0) {
        let a = data[data.length / 2 - 1]
        let b = data[data.length / 2]
        return (a + b) / 2
    }
    else {
        return data[Math.floor(data.length / 2)]
    }
}

function computeMode(data) {
    data.sort((x, y) => x - y);

    var bestStreak = 1;
    var bestElem = data[0];
    var currentStreak = 1;
    var currentElem = data[0];

    for (let i = 1; i < data.length; i++) {
        if (data[i - 1] !== data[i]) {
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
                bestElem = currentElem;
            }

            currentStreak = 0;
            currentElem = data[i];
        }

        currentStreak++;
    }

    return currentStreak > bestStreak ? currentElem : bestElem;
}

function summary(data) {
    console.log('THB value history')
    console.log('average :',computeAverage(data))
    console.log('median :',computeMedian(data))
    console.log('mode :',computeMode(data))
}

(async () => {
    let data = await load_THB_data()
    let value = preprocess(data)
    summary(value)
})()