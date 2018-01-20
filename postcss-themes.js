const postcss = require('postcss');
const palette = require('./themes').palette;
const variables = require('./themes').variables;
const fs = require('fs');
const CleanCSS = require('clean-css');
let selectors = {};

/** [light, dark] */
const themesNames = Object.keys(palette);

let cssVars = '';

Object.keys(variables).forEach(name => {
  const output = `.${name} {
     ${Object.keys(variables[name]).map(key => {
    return `--${key}: ${variables[name][key]};`
  }).join(' ')}
  }`
  cssVars = `${cssVars} ${output}`
});

fs.writeFileSync('dist/vars.css', cssVars);

module.exports = postcss.plugin('datThemes', function datThemes( options ) {

  return ( css ) => {

    options = options || {};

    css.walkRules(( rule ) => {

      rule.walkDecls(( decl, i ) => {
        const value = decl.value;
        const hasThemify = value.indexOf('themify') > -1;

        if( hasThemify ) {

          const regExp = /\(([^)]+)\)/;
          const extractValue = regExp.exec(decl.value)[1];
          themesNames.forEach(name => {
            const selectorGroup = `.${name} ${rule.selector}, ${name}${rule.selector}`;

            /** Replace themify() with the current value */
            const rawValueIE = decl.value.replace(`themify(${extractValue})`, variables[name][extractValue]);
            const rawValue = decl.value.replace(`themify(${extractValue})`, `var(--${extractValue})`);
            const declerations = [
              /** color: red or border: 1px solid red */
              `${decl.prop}: ${rawValueIE};`,
              /** color: var(--primary-100) or border: 1px solid var(--primary-100) */
              `${decl.prop}: ${rawValue};`
            ];

            if( !selectors[selectorGroup] ) {
              selectors[selectorGroup] = {
                declerations: {
                  ie      : new Set([declerations[0]]),
                  defaults: new Set([declerations[1]])
                },
                selectorGroup
              }
            } else {
              declerations.forEach(( d, i ) => {
                if( i === 0 ) {
                  selectors[selectorGroup].declerations.ie.add(d);
                } else {
                  selectors[selectorGroup].declerations.defaults.add(d);
                }

              });
            }
          });
        }
      });
    });

    let outputIE = '';

    for( let selector in selectors ) {
      const raw = `${selectors[selector].selectorGroup} {
         ${Array.from(selectors[selector].declerations.ie).join(' ')}
      }`
      outputIE = `${outputIE} ${raw}`
    }

    let outputDefaults = '';

    for( let selector in selectors ) {
      const raw = `${selectors[selector].selectorGroup} {
         ${Array.from(selectors[selector].declerations.defaults).join(' ')}
      }`
      outputDefaults = `${outputDefaults} ${raw}`
    }
    // fs.writeFileSync('dist/output.css', new CleanCSS({}).minify(output).styles);
    fs.writeFileSync('dist/output-ie.css', outputIE);
    fs.writeFileSync('dist/output-defaults.css', outputDefaults);

  }

});