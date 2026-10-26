# Devclaim.NeosUiEditors

Inspector editors for the Neos UI, one plugin (`Resources/Public/JavaScript/Plugin.js`) loaded with the Neos UI.
Node types use them by name; the values are plain arrays and strings, so any package can store and read them.

| Editor | Value |
| --- | --- |
| `Devclaim.NeosUiEditors/Inspector/Editors/OccurrenceEditor` | Start and end (or duration) of a date and its repetition (RFC 5545): `startDate`, `endDate` or `duration`, `recurrenceRule` (`RRULE:…`), `recurrenceDateTimes` (`RDATE:…`), `exceptionDateTimes` (`EXDATE:…`); dates as `Ymd\THis` |
| `Devclaim.NeosUiEditors/Inspector/Editors/NumberEditor` | A whole number: minus and plus around the value, arrow keys (Shift: ×10); options `min`, `max`, `step`, `unit`, `placeholder`; a value beyond the range becomes the nearest limit, a decimal is rounded |
| `Devclaim.NeosUiEditors/Inspector/Editors/ColorEditor` | A color of its own, `#rrggbb`, or `null`: a swatch with the hex value, a picker with suggested colors |

```yaml
properties:
    schedule:
        type: array
        ui:
            inspector:
                editor: 'Devclaim.NeosUiEditors/Inspector/Editors/OccurrenceEditor'
    limit:
        type: integer
        ui:
            inspector:
                editor: 'Devclaim.NeosUiEditors/Inspector/Editors/NumberEditor'
                editorOptions:
                    min: 1
                    max: 24
    color:
        type: string
        ui:
            inspector:
                editor: 'Devclaim.NeosUiEditors/Inspector/Editors/ColorEditor'
```

The texts are in `Resources/Private/Translations/{de,en}/` (`OccurrenceEditor.xlf`, `NumberEditor.xlf`).

## Development

The editors are a yarn project (`package.json`, workspaces in `Neos.Ui/*`); the occurrence editor is taken from
`Sitegeist.GroundhogDay` (GPL-3.0-or-later). The built plugin is committed. After a change:

```bash
ddev exec -d /var/www/html/DistributionPackages/Devclaim.NeosUiEditors "yarn install && yarn build"
```
