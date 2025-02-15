import { useEffect } from '@wordpress/element'
import { select } from '@wordpress/data'
import { useBlockEditContext } from '@wordpress/block-editor'

export const createUniqueClass = uid => `${ uid.substring( 0, 7 ) }`

export const useUniqueId = ( autoApplyUniqueId = true ) => {
	const { clientId } = useBlockEditContext()

	useEffect( () => {
		const attributes = select( 'core/block-editor' ).getBlockAttributes( clientId )
		if ( ! attributes ) {
			return
		}

		// If auto apply unique id is disabled, don't generate a new one. But if
		// there already is a unique id, we need to still check if it's unique.
		if ( ! autoApplyUniqueId && ! attributes.uniqueId ) {
			return
		}

		// When there's no unique ID yet, create one.
		const uniqueClass = createUniqueClass( clientId )
		if ( ! attributes.uniqueId ) {
			attributes.uniqueId = uniqueClass

			// If there's one already, check whether the we need to re-create one.
			// Duplicating a block or copy pasting a block may give us duplicate IDs.
		} else if ( uniqueClass !== attributes.uniqueId ) {
			if ( document.querySelectorAll( `[data-block-id="${ attributes.uniqueId }"]` ).length > 1 ) {
				attributes.uniqueId = uniqueClass
			}
		}
	}, [ clientId ] )
}
