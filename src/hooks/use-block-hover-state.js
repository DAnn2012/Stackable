import { useBlockEditContext } from '@wordpress/block-editor'
import { registerStore, useSelect, useDispatch } from '@wordpress/data'
import { useCallback } from '@wordpress/element'

// Include all the stored state.
const DEFAULT_STATE = {
	selectedBlock: null,
	hoverState: 'normal',
	hasParentHoverState: false,
	selectedParentHoverBlock: null,
	selectedParentHoverChildren: [],
	selectedHoverChildren: [],

	// Accordion collapsed state.
	hasCollapsedState: false,
	selectedCollapsedBlock: null,
	selectedCollapsedChildren: [],
}

const STORE_ACTIONS = {
	updateSelectedBlock: ( clientId, editorDom ) => {
		// We need to specify `.editor-styles-wrapper` to avoid targeting the navigation list view.
		const blockEl = editorDom?.querySelector( `[data-block="${ clientId }"]` )

		// Get the currently parent-hovered block if there is one.
		const parentHoverEl = blockEl?.closest( '.stk-hover-parent' )?.closest( '[data-block]' )
		const parentHoverClientId = parentHoverEl?.getAttribute( 'data-block' ) || null

		// Get all the child blocks of the currently parent-hovered block.
		const parentHoverChildrenClientIds = Array.from( parentHoverEl?.querySelectorAll( '[data-block]' ) || [] )
			.map( el => el.getAttribute( 'data-block' ) ) || []

		// Get all child blocks of the currently hovered block.
		const hoverChildrenClientIds = Array.from( blockEl?.querySelectorAll( '[data-block]' ) || [] )
			.map( el => el.getAttribute( 'data-block' ) ) || []

		const collapsedEl = blockEl?.closest( '.stk-block-accordion' )?.closest( '[data-block]' ) || ( blockEl?.getAttribute( 'data-type' ) === 'stackable/accordion' ? blockEl : null )
		const collapsedClientId = collapsedEl?.getAttribute( 'data-block' ) || null

		// Get all the child blocks of the accordion block.
		const collapsedChildrenClientIds = Array.from( collapsedEl?.querySelectorAll( '[data-block]' ) || [] )
			.map( el => el.getAttribute( 'data-block' ) ) || []

		return {
			type: 'UPDATE_SELECTED_BLOCK',
			clientId,
			parentHoverClientId,
			hasParentHoverState: !! parentHoverClientId,
			parentHoverChildrenClientIds,
			hoverChildrenClientIds,
			collapsedClientId,
			collapsedChildrenClientIds,
			hasCollapsedState: !! collapsedClientId,
		}
	},
	clearSelectedBlock: () => ( {
		type: 'CLEAR_SELECTED_BLOCK',
	} ),
	updateHoverState: state => ( {
		type: 'UPDATE_HOVER_STATE',
		value: state,
	} ),
}

const STORE_SELECTORS = {
	getSelectedBlock: state => state.selectedBlock,
	getHoverState: state => state.hoverState,
	getHasParentHoverState: state => state.hasParentHoverState,
	getSelectedParentHoverBlock: state => state.selectedParentHoverBlock,
	getSelectedParentHoverBlockChildren: state => state.selectedParentHoverChildren,
	getSelectedHoverChildren: state => state.selectedHoverChildren,
	getHasCollapsedState: state => state.hasCollapsedState,
	getSelectedCollapsedBlock: state => state.selectedCollapsedBlock,
	getSelectedCollapsedBlockChildren: state => state.selectedCollapsedChildren,
}

const STORE_REDUCER = ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
		case 'UPDATE_SELECTED_BLOCK': {
			return {
				...state,
				selectedBlock: action.clientId,
				// hoverState: 'normal', // Don't reset the hover state.
				selectedParentHoverBlock: action.parentHoverClientId,
				hasParentHoverState: action.hasParentHoverState,
				selectedParentHoverChildren: action.parentHoverChildrenClientIds,
				selectedHoverChildren: action.hoverChildrenClientIds,

				// Accordion collapsed state.
				hasCollapsedState: action.hasCollapsedState,
				selectedCollapsedBlock: action.collapsedClientId,
				selectedCollapsedChildren: action.collapsedChildrenClientIds,
			}
		}
		case 'CLEAR_SELECTED_BLOCK': {
			return {
				...DEFAULT_STATE,
			}
		}
		case 'UPDATE_HOVER_STATE': {
			return {
				...state,
				hoverState: action.value,
			}
		}
	}
	return state
}

registerStore( 'stackable/hover-state', {
	reducer: STORE_REDUCER,
	actions: STORE_ACTIONS,
	selectors: STORE_SELECTORS,
} )

export const useBlockHoverState = () => {
	const { clientId } = useBlockEditContext()

	const { updateHoverState } = useDispatch( 'stackable/hover-state' )
	const setHoverState = useCallback( state => {
		updateHoverState( state )
	}, [] )

	const hoverState = useSelect(
		select => select( 'stackable/hover-state' ).getHoverState(),
		[]
	)

	const {
		getSelectedBlock,
		getSelectedParentHoverBlock,
		getSelectedParentHoverBlockChildren,
		getSelectedHoverChildren,
		getHasParentHoverState,
		getHasCollapsedState,
		getSelectedCollapsedBlock,
		getSelectedCollapsedBlockChildren,
	} = useSelect( 'stackable/hover-state' )

	const hoverStateClientId = getSelectedBlock()
	const parentHoverClientId = getSelectedParentHoverBlock()
	const parentHoverChildrenClientIds = getSelectedParentHoverBlockChildren()
	const hoverChildrenClientIds = getSelectedHoverChildren()
	const hasParentHoverState = getHasParentHoverState()
	const hasCollapsedState = getHasCollapsedState()
	const collapsedClientId = getSelectedCollapsedBlock()
	const collapsedChildrenClientIds = getSelectedCollapsedBlockChildren()

	const isBlockSelected = clientId === hoverStateClientId
	const isParentHoverBlock = clientId === parentHoverClientId
	const isChildOfParentHover = parentHoverChildrenClientIds.includes( clientId )
	const isChildOfHoverBlock = hoverChildrenClientIds.includes( clientId )
	const isCollapsedBlock = clientId === collapsedClientId
	const isChildOfCollapsedBlock = collapsedChildrenClientIds.includes( clientId )

	// The hover state only applies to the currently selected block.
	let blockHoverClass = ''
	let currentHoverState = 'normal'
	if ( isBlockSelected ) {
		if ( hoverState === 'hover' || hoverState === 'parent-hovered' ) {
			blockHoverClass = 'stk--is-hovered'
		}

		currentHoverState = hoverState

		// If we changed the hover state to parent-hovered, but the block
		// doesn't have a parent to hover, make it hover instead.
		if ( ! hasParentHoverState && hoverState === 'parent-hovered' ) {
			currentHoverState = 'hover'
		}

	// Also change the hover states of the other
	} else if ( isParentHoverBlock ) {
		if ( hoverState === 'hover' || hoverState === 'parent-hovered' ) {
			blockHoverClass = 'stk--is-hovered'
			currentHoverState = 'hover'
		}
	} else if ( isChildOfParentHover || isChildOfHoverBlock ) {
		if ( hoverState === 'hover' || hoverState === 'parent-hovered' ) {
			blockHoverClass = 'stk--is-hovered'
			currentHoverState = 'parent-hovered'
		}
	} else if ( isChildOfCollapsedBlock || isCollapsedBlock ) {
		// We won't add any classes here anymore.
		currentHoverState = 'collapsed'
	}

	return [ currentHoverState, setHoverState, blockHoverClass, hasParentHoverState, hasCollapsedState, isCollapsedBlock ]
}

export const useBlockHoverClass = () => {
	const hoverState = useBlockHoverState()
	return hoverState[ 2 ]
}
