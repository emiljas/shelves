import TextType = require('./TextType');

interface TextModel {
    value: string;
    type: TextType;
    dx: number; //destination x
    dy: number; //destincation y
}

export = TextModel;
