import { getName, quotePath } from '../utils/map-helpers.js';
import getInteropBlock from './shared/getInteropBlock.js';
import getExportBlock from './shared/getExportBlock.js';
import esModuleExport from './shared/esModuleExport.js';

export default function amd ( bundle, magicString, { exportMode, indentString }, options ) {
	const deps = bundle.externalModules.map( quotePath );
	const args = bundle.externalModules.map( getName );

	if ( exportMode === 'named' ) {
		args.unshift( `exports` );
		deps.unshift( `'exports'` );
	}

	const params =
		( options.moduleId ? `'${options.moduleId}', ` : `` ) +
		( deps.length ? `[${deps.join( ', ' )}], ` : `` );

	const useStrict = options.useStrict !== false ? ` 'use strict';` : ``;
	const intro = `define(${params}function (${args.join( ', ' )}) {${useStrict}\n\n`;

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock( bundle );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	const exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( exportMode === 'named' ) magicString.append( `\n\n${esModuleExport}` );
	if ( options.outro ) magicString.append( `\n${options.outro}` );

	return magicString
		.indent( indentString )
		.append( '\n\n});' )
		.prepend( intro );
}
