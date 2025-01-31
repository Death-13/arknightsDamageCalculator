let damageChart;

function getInputValue(id, defaultValue = 0) {
    return parseFloat(document.querySelector(`#${id}`).value) || defaultValue;
}

function calculateDamage() {
    const statNumbers = [];
    const damageNumbers = [];
    const dpsNumbers = [];

    const atk = getInputValue('atk');
    const hits = getInputValue('hits', 1);
    const dType = document.querySelector('#dType').value
    const aspd = getInputValue('aspd', 1);
    const allPercentageDebuffs = [
        getInputValue('pDebuff1') / 100,
        getInputValue('pDebuff2') / 100,
        getInputValue('pDebuff3') / 100
    ];

    const finalPercentageDebuff = 1 - allPercentageDebuffs.reduce((a, b) => a * (1 - b), 1);

    const flatDebuff = getInputValue('fDebuff');
    const percentageIgnore = getInputValue('pIgnore') / 100;
    const flatIgnore = getInputValue('fIgnore');

    const allMultipliers = [
        getInputValue('mlt1', 1),
        getInputValue('mlt2', 1),
        getInputValue('mlt3', 1)
    ];
    const finalMultiplier = allMultipliers.reduce((a, b) => a * b, 1);

    const allAmplifications = [
        getInputValue('amp1') / 100,
        getInputValue('amp2') / 100,
        getInputValue('amp3') / 100
    ].filter(amp => amp !== 0).map(amp => 1 + amp);
    const finalAmplification = allAmplifications.reduce((a, b) => a * b, 1);

    const minDamage = parseInt(atk * 0.05);

    if (dType === 'physical') {
        let addDef;

        if (screen.width <= 786) {
            addDef = 500;
        } else {
            addDef = 100;
        }

        for (let def = 0; def <= 5000; def += addDef) {
            const modifiedDef = (def - flatDebuff) * (1 - finalPercentageDebuff);
            const damage = Math.max(((atk * finalMultiplier) - ((modifiedDef - flatIgnore) * (1 - percentageIgnore))) * finalAmplification * hits, minDamage * finalAmplification * hits);
            const dps = damage / aspd;

            damageNumbers.push(damage);
            statNumbers.push(def);
            dpsNumbers.push(dps);
        }
    } else if (dType === 'arts' || dType === 'elemental') {
        for (let res = 0; res <= 100; res += 5) {
            const modifiedRes = (res - flatDebuff) * (1 - finalPercentageDebuff);
            const damage = Math.max(atk * finalMultiplier * (1 - ((modifiedRes - flatIgnore) * (1 - percentageIgnore)) / 100) * finalAmplification * hits, minDamage * finalAmplification * hits);
            const dps = damage / aspd;

            damageNumbers.push(damage);
            statNumbers.push(res);
            dpsNumbers.push(dps);
        }

    } else if (dType === "true") {
        const damage = atk * finalMultiplier * finalAmplification * hits;
        damageNumbers.push(damage);
        statNumbers.push("True Damage");
        dpsNumbers.push(damage / aspd);
    } else {
        alert('ERROR');
    }

    return { damageNumbers, statNumbers, dpsNumbers, dType }
}

function generateChart(data) {
    const ctx = document.querySelector('#damageChart').getContext('2d');

    if (damageChart) {
        damageChart.destroy();
    }

    const scaleTitle = data.dType === 'arts' ? 'Enemy Resistance (%)' : data.dType === 'elemental' ? 'Enemy Elemental Resistance (%)' : data.dType === 'true' ? 'True Damage' : 'Enemy Defense';

    damageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.statNumbers,
            datasets: [{
                label: 'Damage Per Hit (DPH)',
                data: data.damageNumbers,
                borderColor: '#00c2ee',
                backgroundColor: '#00c2ee80',
                borderWidth: 1
            }, {
                label: 'Damage Per Second (DPS)',
                font: {
                    size: 5,
                },
                data: data.dpsNumbers,
                borderColor: '#ff0000',
                backgroundColor: '#ff000080',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            color: '#FAFAFA',
            scales: {
                x: {
                    ticks: {
                        color: '#FAFAFA'
                    },
                    title: {
                        display: true,
                        text: scaleTitle,
                        color: '#FAFAFA',
                        font: {
                            size: 15,
                        },
                    },
                    grid: {
                        color: '#1A2C3D'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FAFAFA',
                    },
                    title: {
                        display: true,
                        text: 'Damage',
                        color: '#FAFAFA',
                        font: {
                            size: 15,
                        },
                    },
                    grid: {
                        color: '#1A2C3D'
                    }
                },

            }
        }
    });

    if (screen.width <= 786) {
        damageChart.aspectRatio = 1;
        damageChart.resize();
    }
}

function submit() {
    const data = calculateDamage();

    generateChart(data);

}