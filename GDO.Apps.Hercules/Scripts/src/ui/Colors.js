export const deployerColors = {
    MAIN: '#80CBC4',
    NODE: '#1976D2',
    NODE_MERGE: '#64DD17',
    NODE_SELECT: '#00BCD4',
    NODE_SECTION: '#607D8B',
    NODE_SECTION_SELECT: '#AA00FF'
};

const indigoColors = ['#7986CB', '#5C6BC0', '#3F51B5', '#3949AB', '#303F9F', '#283593', '#1A237E'];

const tealColors = [
    '#4DB6AC',
    '#26A69A',
    '#009688',
    '#00897B',
    '#00796B',
    '#00695C',
    '#004D40'
];

const blueGreyColors = [
    '#90A4AE',
    '#78909C',
    '#607D8B',
    '#546E7A',
    '#455A64',
    '#37474F',
    '#263238'
];

const purpleColors = [
    '#BA68C8',
    '#AB47BC',
    '#9C27B0',
    '#8E24AA',
    '#7B1FA2',
    '#6A1B9A',
    '#4A148C'
];


class ElevatorColorIterator {
    constructor (colorArray) {
        this.colorArray = colorArray || defaultColorArray;
        this.index = 0;
    }

    getNext () {
        var colors = this.colorArray,
            index = this.index++,
            l = colors.length - 1,
            evenCycle = (Math.floor(index / l) % 2) === 0,
            selector = (index % l) + 1;

        if (evenCycle)
            return colors[selector];
        else
            return colors[l - selector];
    }
}

class WrapColorIterator {
    constructor (colorArray) {
        this.colorArray = colorArray || defaultColorArray;
        this.index = 0;
    }

    getNext () {
        var colors = this.colorArray,
            index = this.index++,
            l = colors.length;

        return colors[index % l];
    }
}

export const IndigoIterator = () => new ElevatorColorIterator(indigoColors);
export const TealIterator = () => new ElevatorColorIterator(tealColors);
export const GrayIterator = () => new ElevatorColorIterator(blueGreyColors);
export const PurpleIterator = () => new ElevatorColorIterator(purpleColors);
