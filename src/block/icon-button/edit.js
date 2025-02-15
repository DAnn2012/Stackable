/**
 * External dependencies
 */
import classnames from 'classnames'
import { version as VERSION } from 'stackable'
import {
	InspectorTabs,
} from '~stackable/components'
import {
	BlockDiv,
	useGeneratedCss,
	Advanced, CustomCSS,
	Responsive,
	Button,
	BlockStyle,
	CustomAttributes,
	EffectsAnimations,
	ConditionalDisplay,
	Transform,
} from '~stackable/block-components'
import {
	useBlockHoverClass,
} from '~stackable/hooks'
import { withQueryLoopContext } from '~stackable/higher-order'

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n'

/**
 * Internal dependencies
 */
import { IconButtonStyles } from './style'
import { blockStyles } from './block-styles'

const Edit = props => {
	const {
		className,
	} = props

	useGeneratedCss( props.attributes )

	const blockHoverClass = useBlockHoverClass()
	const customAttributes = CustomAttributes.getCustomAttributes( props.attributes )

	const blockClassNames = classnames( [
		className,
		'stk-block-icon-button',
		blockHoverClass,
	] )

	return (
		<>
			<InspectorTabs />
			<BlockDiv.InspectorControls />

			<BlockStyle.InspectorControls styles={ blockStyles }>
				<Button.InspectorControls.HoverEffects />
			</BlockStyle.InspectorControls>
			<Button.InspectorControls.Link />
			<Button.InspectorControls.Colors
				hasTextColor={ false }
				hasIconColor={ true }
			/>
			<Button.InspectorControls.Icon hasColor={ false } />
			<Button.InspectorControls.Size hasWidth={ true } />
			<Button.InspectorControls.Borders
				borderSelector=".stk-button"
				placeholder="24"
			/>

			<Advanced.InspectorControls />
			<Transform.InspectorControls />
			<EffectsAnimations.InspectorControls />
			<CustomAttributes.InspectorControls />
			<CustomCSS.InspectorControls mainBlockClass="stk-block-icon-button" />
			<Responsive.InspectorControls />
			<ConditionalDisplay.InspectorControls />

			<IconButtonStyles version={ VERSION } />
			<CustomCSS mainBlockClass="stk-block-icon-button" />

			<BlockDiv
				className={ blockClassNames }
				applyAdvancedAttributes={ false }
				applyCustomAttributes={ false }
			>
				<Button
					linkTrigger=".stk--inner-svg"
					buttonProps={ {
						id: props.attributes.anchor || undefined,
						...customAttributes,
					} }
				/>
			</BlockDiv>
		</>
	)
}

export default withQueryLoopContext( Edit )
