import './design'
/**
 * BLOCK: Posts
 */
/**
 * Internal dependencies
 */
import variations from './variations'
import edit from './edit'
import save from './save'
import schema from './schema'
import metadata from './block.json'
import example from './example'
import { BlogPostsIcon } from '~stackable/icons'
import { applyFilters } from '@wordpress/hooks'
import deprecated from './deprecated'

export const settings = applyFilters( 'stackable.block.metadata', {
	...metadata,
	icon: BlogPostsIcon,
	supports: {
		align: [ 'center', 'wide', 'full' ],
		anchor: true,
		stkAlign: true,
	},
	attributes: schema,
	example,
	deprecated,

	variations,
	edit,
	save,
} )
