/**
 * A Panel for selecting designs
 */
/**
 * External dependencies
 */
import classnames from 'classnames'
import { i18n } from 'stackable'
import { useGlobalState } from '~stackable/util/global-state'

/**
 * WordPress dependencies
 */
import {
	Fragment,
	useState,
	useMemo,
	useEffect,
	useCallback,
} from '@wordpress/element'
import { addFilter, removeFilter } from '@wordpress/hooks'
import { FormToggle, PanelBody } from '@wordpress/components'
import { __ } from '@wordpress/i18n'
import { useBlockEditContext } from '@wordpress/block-editor'

const PanelAdvancedSettings = props => {
	// Remember whether this panel was open/closed before.
	const { isSelected, name } = useBlockEditContext()
	const [ tab ] = useGlobalState( `tabCache-${ name }`, 'style' )
	const [ initialOpen, setInitialOpen ] = useGlobalState( `panelCache-${ name }-${ tab }-${ props.title }`, props.initialOpen )

	const [ isOpen, setIsOpen ] = useState( initialOpen )
	const [ showAdvanced, setShowAdvanced ] = useState( props.initialAdvanced )
	const instanceId = useMemo( () => parseInt( ( Math.random() * 1000000 ), 10 ), [] )

	const hasToggle = props.hasToggle && props.onChange

	const checkIfAttributeShouldToggleOn = useCallback( ( attributes, blockProps ) => {
		if ( ! props.hasToggle || ! props.toggleAttributeName || ! props.toggleOnSetAttributes.length ) {
			return attributes
		}

		// Don't do anything if turned on already.
		if ( blockProps.attributes[ props.toggleAttributeName ] ) {
			return attributes
		}

		console.warn( '[Stackable V3 deprecation warning] toggleOnSetAttributes and toggleAttributeName props of PanelAdvancedSettings are deprecated, use stackable/hooks/useDidAttributesChange instead' ) // eslint-disable-line no-console

		// Check if an attribute we're watching for was modified with a value.
		let checkToggle = false
		props.toggleOnSetAttributes.some( attrName => {
			if ( Object.keys( attributes ).includes( attrName ) ) {
				if ( attributes[ attrName ] !== '' ) {
					checkToggle = true
					return true
				}
			}
			return false
		} )

		// Toggle on the "show" attribute along with the other attributes being set.
		if ( checkToggle ) {
			if ( props.onChange ) {
				props.onChange( true )
			}
			return {
				...attributes,
				[ props.toggleAttributeName ]: true,
			}
		}

		return attributes
	}, [ hasToggle, props.toggleAttributeName, props.toggleOnSetAttributes, props.onChange ] )

	useEffect( () => {
		addFilter( 'stackable.setAttributes', `stackable/panel-advanced-settings-${ instanceId }`, checkIfAttributeShouldToggleOn, 9 )
		return () => {
			removeFilter( 'stackable.setAttributes', `stackable/panel-advanced-settings-${ instanceId }` )
		}
	}, [] )

	const onToggle = useCallback( () => {
		setIsOpen( ! isOpen )
		setInitialOpen( ! isOpen )
		if ( props.onToggle ) {
			props.onToggle( ! isOpen )
		}
	}, [ isOpen ] )
	const onAdvancedToggle = useCallback( () => setShowAdvanced( ! showAdvanced ), [ showAdvanced ] )

	const mainClasses = classnames( [
		props.className,
		'ugb-toggle-panel-body',
	], {
		'ugb-toggle-panel-body--advanced': showAdvanced,
		[ `ugb-panel--${ props.id }` ]: props.id,
	} )

	const title = useMemo( () => {
		return <Fragment>
			{ hasToggle && (
				<span className={ `editor-panel-toggle-settings__panel-title` }>
					<FormToggle
						className="ugb-toggle-panel-form-toggle"
						checked={ props.checked }
						onClick={ ev => {
							ev.stopPropagation()
							ev.preventDefault()
							const checked = props.checked
							if ( checked && isOpen ) {
								// Comment this out since it jumps the inspector.
								// this.onToggle()
							} else if ( ! checked && ! isOpen ) {
								onToggle()
							}
							if ( props.onChange ) {
								props.onChange( ! checked )
							}
						} }
						aria-describedby={ props.title }
					/>
					{ props.title }
				</span>
			) }
			{ ! hasToggle && props.title }
		</Fragment>
	}, [ onToggle, hasToggle, props.checked, props.onChange, props.title ] )

	return ( isSelected || ! name ) && ( // If there's no name, then the panel is used in another place.
		<PanelBody
			className={ mainClasses }
			initialOpen={ initialOpen }
			onToggle={ onToggle }
			opened={ props.isOpen !== null ? props.isOpen : isOpen }
			title={ title }
		>
			{ props.children }
			{ showAdvanced && props.advancedChildren }
			{ props.advancedChildren && (
				<button
					className="ugb-panel-advanced-button"
					onClick={ onAdvancedToggle }
				>{ showAdvanced ? __( 'Simple', i18n ) : __( 'Advanced', i18n ) }</button>
			) }
		</PanelBody>
	)
}

PanelAdvancedSettings.defaultProps = {
	id: '',
	className: '',
	title: __( 'Settings', i18n ),
	checked: false,
	onChange: null,
	initialOpen: false,
	hasToggle: true,
	initialAdvanced: false,
	advancedChildren: null,
	onToggle: () => {},
	isOpen: null,
	// Deprecated on v3:
	toggleOnSetAttributes: [],
	toggleAttributeName: '',
}

export default PanelAdvancedSettings
