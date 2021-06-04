// @flow
import m from "mithril"
import {lang} from "../misc/LanguageViewModel"
import {assertMainOrNode} from "../api/common/Env"
import {Dialog} from "../gui/base/Dialog"
import {ButtonType} from "../gui/base/ButtonN"
import type {Theme} from "../gui/theme"
import {themeManager} from "../gui/theme"
import type {DialogHeaderBarAttrs} from "../gui/base/DialogHeaderBar"
import {Keys} from "../api/common/TutanotaConstants"
import type {TextFieldAttrs} from "../gui/base/TextFieldN"
import {TextFieldN} from "../gui/base/TextFieldN"
import stream from "mithril/stream/stream.js"
import {downcast} from "../api/common/utils/Utils"
import type {SegmentControlItem} from "../gui/base/SegmentControl"
import {SegmentControl} from "../gui/base/SegmentControl"
import {SimpleCustomColorEditor} from "./SimpleCustomColorEditor"
import {deviceConfig} from "../misc/DeviceConfig"

assertMainOrNode()

let COLOR_FORMAT = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")

export const SettingsState = Object.freeze({
	Simple: 'Simple',
	Advanced: 'Advanced'
})

export function show(themeToEdit: Theme, onThemeChanged: (Theme) => mixed) {
	const colorFieldsAttrs = Object.keys(themeManager.getDefaultTheme())
	                               .filter(name => name !== "logo" && name !== "themeId")
	                               .sort((a, b) => a.localeCompare(b))
	                               .map(colorName => {
			                               // value is closed over by injectionsRight,
			                               // so the color switch will always be up to date with the contents of the text field
			                               const value = stream(themeToEdit[colorName] || "")
			                               return {
				                               label: () => colorName,
				                               value: value,
				                               injectionsRight: () => [
					                               m("", {
						                               style: {
							                               width: "106px", // 100 + 6px negative margin
							                               height: "20px",
							                               "margin-bottom": "2px",
							                               "background-color": getValidColorValue(value()) || "transparent"
						                               }
					                               })
				                               ]
			                               }
		                               }
	                               )

	const nbrOfLeftColors = Math.ceil(colorFieldsAttrs.length / 2.0)
	const leftColumnsAttrs = colorFieldsAttrs.slice(0, nbrOfLeftColors)
	const rightColumnsAttrs = colorFieldsAttrs.slice(nbrOfLeftColors)
	const settingsViewType = stream(SettingsState.Simple)
	let newTheme = themeToEdit.logo ? {"logo": themeToEdit.logo} : {}


	let accentColor = stream(themeManager._getTheme(deviceConfig.getTheme()).content_accent)

	const SettingsItems: SegmentControlItem<string>[] = [
		{name: lang.get("simpleSettings_label"), value: SettingsState.Simple},
		{name: lang.get("advancedSettings_label"), value: SettingsState.Advanced}
	]

	const form = {
		view: () => {
			return m(".pb", [
				m(SegmentControl, {
					selectedValue: settingsViewType,
					items: SettingsItems
				}),
				settingsViewType() === SettingsState.Simple
					? m(SimpleCustomColorEditor, {
						accentColor: accentColor,
						updateCustomTheme: applyCustomTheme,
					})
					: [
						m(".small.mt", lang.get('customColorsInfo_msg')),
						m(".wrapping-row", [
							m("", leftColumnsAttrs.map(c => {
								return m("", [
									m(TextFieldN, c),
									_getDefaultColorLine(c)
								])
							})),
							m("", rightColumnsAttrs.map(c => {
								return m("", [
									m(TextFieldN, c),
									_getDefaultColorLine(c)
								])
							}))
						])
					],
			])
		}
	}

	const applyCustomTheme = () => {
		newTheme = {
			"list_accent_fg": accentColor(),
			"content_accent": accentColor(),
			"content_button_selected": accentColor(),
			"navigation_button_selected": accentColor(),
			"header_button_selected": accentColor()
		}
		onThemeChanged(downcast(newTheme))
	}

	const cancelAction = () => {
		const managerTheme = themeManager.customTheme
		if (managerTheme) {
			managerTheme.content_accent
		} else {
			themeManager.getDefaultTheme().content_accent
		}
		dialog.close()
	}
	const okAction = () => {
		if (settingsViewType() === SettingsState.Simple) {
			applyCustomTheme()
		} else {
			for (let i = 0; i < colorFieldsAttrs.length; i++) {
				let colorValue = colorFieldsAttrs[i].value().trim()
				if (colorValue) {
					if (COLOR_FORMAT.test(colorValue)) {
						newTheme[(colorFieldsAttrs[i]: any).label()] = colorValue
					} else {
						Dialog.error("correctValues_msg")
						return
					}
				}
			}
		}
		onThemeChanged(downcast(newTheme))
		dialog.close()
	}

	let actionBarAttrs: DialogHeaderBarAttrs = {
		left: [{label: "cancel_action", click: cancelAction, type: ButtonType.Secondary}],
		right: [{label: "ok_action", click: okAction, type: ButtonType.Primary}],
		middle: () => lang.get("customColors_label")
	}

	let dialog = Dialog.largeDialog(actionBarAttrs, form)
	                   .addShortcut({
		                   key: Keys.ESC,
		                   exec: cancelAction,
		                   help: "close_alt"
	                   }).setCloseHandler(cancelAction)
	                   .show()
}

function getValidColorValue(colorValue: string): ?string {
	const trimmedColorValue = colorValue.trim()
	if (trimmedColorValue && COLOR_FORMAT.test(trimmedColorValue)) {
		return trimmedColorValue
	} else {
		return null
	}
}

function _getDefaultColorLine(field: TextFieldAttrs): Child {
	let colorValue = getValidColorValue(field.value())
	if (!field.value().trim() || colorValue) {
		let colorName = (field: any).label()
		return m(".small.flex-space-between", [
			m("", lang.get("defaultColor_label", {"{1}": themeManager.getDefaultTheme()[colorName]})),
			m("", {
				style: {
					width: '100px',
					height: '10px',
					"margin-top": "2px",
					"background-color": themeManager.getDefaultTheme()[colorName]
				}
			})
		])
	} else {
		return m(".small", lang.get("invalidInputFormat_msg"))
	}
}