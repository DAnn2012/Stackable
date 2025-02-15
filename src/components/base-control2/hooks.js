/**
 * Internal dependencies
 */
import { useAttributeName, useBlockAttributes } from '~stackable/hooks'

/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element'
import { useBlockEditContext } from '@wordpress/block-editor'
import { useDispatch } from '@wordpress/data'

export const useControlHandlers = ( attribute, responsive = false, hover = false, valueCallback = null, changeCallback = null ) => {
	const { clientId } = useBlockEditContext()
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' )

	const attributes = useBlockAttributes( clientId )
	const attrName = useAttributeName( attribute, responsive, hover )

	const originalValue = attributes ? attributes[ attrName ] : ''
	let value = attributes ? attributes[ attrName ] : ''
	if ( valueCallback ) {
		value = valueCallback( value )
	}

	const onChange = useCallback( _value => {
		const value = changeCallback ? changeCallback( _value, originalValue ) : _value
		updateBlockAttributes( clientId, { [ attrName ]: value } )
	}, [ clientId, attrName, changeCallback, originalValue, updateBlockAttributes ] )

	return [ value, onChange ]
}
