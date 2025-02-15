/**
 * Internal dependencies
 */
import './store'
import { PanelAdvancedSettings } from '~stackable/components'

/**
 * External dependencies
 */
import classnames from 'classnames'
import { i18n } from 'stackable'

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n'
import {
	useBlockEditContext,
	__experimentalListView as ListView, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	store as blockEditorStore,
	InspectorControls,
} from '@wordpress/block-editor'
import { ResizableBox } from '@wordpress/components'
import { useSelect, useDispatch } from '@wordpress/data'
import { addFilter } from '@wordpress/hooks'
import { useState } from '@wordpress/element'

const MIN_HEIGHT = 38

export const Edit = () => {
	const { clientId, isSelected } = useBlockEditContext()
	const [ isResizing, setIsResizing ] = useState( false )
	const { updateHeight, updateIsOpen } = useDispatch( 'stackable/navigation-view' )

	const {
		height,
		isOpen,
	} = useSelect( select => {
		return {
			height: select( 'stackable/navigation-view' ).getHeight(),
			isOpen: select( 'stackable/navigation-view' ).getIsOpen(),
		}
	} )

	const { blocks, isOnlyBlock } = useSelect( select => {
		// Get the main root block which we will show the blocks of.
		const parents = select( blockEditorStore ).getBlockParents( clientId )
		const baseClientId = parents.length ? parents[ 0 ] : clientId

		// These are all the children of the block.
		const childBlocks = select( blockEditorStore ).__unstableGetClientIdsTree( baseClientId )

		// We need to add the block itself as well so the user can navigate throughout the whole block.
		return {
			blocks: [ {
				clientId: baseClientId,
				innerBlocks: childBlocks,
			} ],
			isOnlyBlock: ! childBlocks.length && baseClientId === clientId,
		}
	} )

	// Don't show if this is the only block.
	if ( ! isSelected || isOnlyBlock ) {
		return null
	}

	const classNames = classnames( [
		'stk-navigation-view__wrapper',
		'edit-post-sidebar', // So that we can get the width of the sidebar.
	], {
		'stk--is-resizing': isResizing,
	} )

	return (
		<InspectorControls>
			{ /** This adds the styling necessary for the inspector to allot some space for the list view. */ }
			<style>
				{ ! isResizing ? `:is(.edit-post-sidebar, .edit-widgets-sidebar, .interface-complementary-area) {
					--stk-inspector-navigation-view: ${ height }px;
				}` : '' }
			</style>
			<ResizableBox
				className={ classNames }
				showHandle={ isOpen }
				enable={ { top: true } }
				size={ { height } }
				onResizeStart={ () => {
					setIsResizing( true )
				} }
				onResizeStop={ ( e, direction, ref, d ) => {
					const newHeight = height + d.height
					// There may be times that the height goes negative, prevent that.
					updateHeight( newHeight < MIN_HEIGHT ? MIN_HEIGHT : newHeight )
					setIsResizing( false )
				} }
				minHeight={ MIN_HEIGHT }
				maxHeight={ 1000 }
			>
				<PanelAdvancedSettings
					title={ __( 'Navigation', i18n ) }
					id="navigation-view"
					isOpen={ isOpen }
					onToggle={ () => updateIsOpen( ! isOpen ) }
				>
					<div className="stk-panel--navigation-view__wrapper">
						<ListView
							blocks={ blocks }
							showOnlyCurrentHierarchy
							showAppender
							showBlockMovers
							showNestedBlocks
							__experimentalFeatures
							__experimentalPersistentListViewFeatures
						/>
					</div>
				</PanelAdvancedSettings>
			</ResizableBox>
		</InspectorControls>
	)
}

Edit.defaultProps = {
	hasToggle: false,
}

// Don't include the list view from auto-closing.
addFilter( 'stackable.panel.tabs.panel-auto-close', 'stackable/navigation-view', ( doToggle, toggle ) => {
	if ( toggle.closest( '.ugb-panel--navigation-view' ) ) {
		return false
	}
	return doToggle
} )
