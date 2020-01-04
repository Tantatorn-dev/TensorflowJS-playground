const csvtojson = require('csvtojson')
const tf = require('@tensorflow/tfjs')
const plotlib = require('nodeplotlib')

function load_THB_data() {
    return csvtojson().fromFile('THB.csv')
}

function preprocess(data) {
    let xs = []
    let ys = []
    Object.keys(data).map((i) => {
        xs.push(data[i]['date'])
        ys.push(Number.parseFloat(data[i]['value']))
    })
    return [xs,ys]
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
    let temp = [...data]
    console.log('THB value history')
    console.log('average :',computeAverage(temp))
    console.log('median :',computeMedian(temp))
    console.log('mode :',computeMode(temp))
}

function create_model(){
    const model = tf.sequential()

    model.add(tf.layers.dense({
        units: 1,
        inputShape: 1,
        activation: "linear"
    }))

    model.add(tf.layers.dense({
        units:1,
        activation:"linear"
    }))
    
    model.summary()

    LEARNING_RATE = 0.01

    model.compile({
        loss: tf.losses.absoluteDifference,
        optimizer: tf.train.sgd(LEARNING_RATE)
    })

    return model
}

function train(model, xs, ys) {
    return model.fit(xs, ys, {
        batchSize: 32,
        validationSplit: 0.2,
        epochs: 100,
        shuffle: true,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                console.log(`ep:${epoch}\tlogs:${JSON.stringify(logs)}`)
            }
        },
        verbose: 1
    })
}

function sample_evaluation(model, xs, ys) {
    y_pred = model.predict(xs.slice(0, 10))
    console.log('y_pred')
    console.log(y_pred.arraySync())
    console.log()
    console.log('y_true')
    console.log(ys.slice(0, 10).arraySync())
}

(async () => {
    let raw_data = await load_THB_data()
    let value = preprocess(raw_data)
    const data = [{x:value[0].reverse(),y:value[1],type:'scatter'}]
    plotlib.plot(data)

    summary(value[1])
    
})()