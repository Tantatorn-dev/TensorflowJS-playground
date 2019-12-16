const tf = require('@tensorflow/tfjs')

const csvtojson = require('csvtojson')

const feat = ['field1','crim','zn','indus','chas','nox','rm','age','dis','rad','tax','ptratio','black','lstat']

function load_boston() {
    return csvtojson().fromFile('Boston.csv')
}

function preprocess(boston) {
    var xs = []
    var ys = []

    // *** preprocess data
    for(let i=0;i<=500;i++){
        let temp = []
        for(let j=0;j<=12;j++){
            temp.push(Number.parseFloat(boston[i][feat[j]]))
        }
        xs.push(temp)
    }

    for(let i=0;i<=500;i++){
        ys.push([Number.parseFloat( boston[i]['medv'])])
    }

    xs = tf.tensor2d(xs)
    ys = tf.tensor2d(ys)

    return [xs, ys]
}

function create_model() {

    const model = tf.sequential()

    // *** improve your model
    model.add(tf.layers.dense({
        units: 13,
        inputShape: 13,
        activation: 'linear'
    }))

    model.add(tf.layers.dense({
        units: 1,
        activation: 'linear'
    }))
    model.summary()

    LEARNING_RATE = 0.01
    model.compile({
        loss: tf.losses.meanSquaredError,
        optimizer: tf.train.adam(LEARNING_RATE),
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
    const boston = await load_boston()

    
    console.log('boston object')
    console.log(boston)

    const [
        xs,
        ys
    ] = preprocess(boston)
    console.log('preprocess')
    console.log('xs')
    console.log(xs)
    console.log('ys')
    console.log(ys)

    const model = create_model()

    await train(model, xs, ys)

    sample_evaluation(model, xs, ys)
})()