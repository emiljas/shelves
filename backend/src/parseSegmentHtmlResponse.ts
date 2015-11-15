'use strict';

const SPRITE_IMG_URL_REGEX = /http:\/\/www\.ros\.net\.pl\/RossmannV4_Shelves_Sprites\/[\d]+_.+\/output\.png/;
const COORDS_STYLE_REGEX = /\.[a-z0-9]+ { width: \d+px; height: \d+px; background-position: [-]?\d+px [-]?\d+px; margin-left: \d+px; }/g;
const COORDS_VALUES_REGEX = /[-]?\d+/g;

export default function parseSegmentHtmlResponse(response: string): SegmentHtmlResponseData {
      let spriteImgUrl = response.match(SPRITE_IMG_URL_REGEX)[0];

      let coords = [];
      let coordsStyles = response.match(COORDS_STYLE_REGEX);
      for(let style of coordsStyles) {
        let openBracketIndex = style.indexOf('{');
        let closeBracketIndex = style.indexOf('}');
        style = style.substring(openBracketIndex + 1, closeBracketIndex);
        style = style.replace(/ /g, ' ');
        style = style.replace(/px/g, ' ');
        style = style.replace(/:/g, ' ');
        style = style.replace(/width/g, ' ');
        style = style.replace(/height/g, ' ');
        style = style.replace(/background-position/g, ' ');
        style = style.replace(/margin-left/g, ' ');
        style = style.replace(/;/g, ' ');

        let digits = style.match(COORDS_VALUES_REGEX);
        coords.push({
          width: parseInt(digits[0]),
          height: parseInt(digits[1]),
          x: Math.abs(parseInt(digits[2])),
          y: Math.abs(parseInt(digits[3]))
        });
      }

      return {
        spriteImgUrl: spriteImgUrl,
        coordsList: coords
      };
}
