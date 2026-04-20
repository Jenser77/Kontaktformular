/** Main-site navigation URLs (Diakoniestiftung CMS) — single source of truth for the chrome header. */

export type NavLink = {
	label: string;
	href: string;
	/** Adds target="_blank" and rel="noopener noreferrer" */
	external?: boolean;
};

export type NavGroupItem = NavLink & {
	items: NavLink[];
};

export type FachbereichNavEntry = NavGroupItem | NavLink;

/** Fachbereiche dropdown (first top-level nav item). */
export const fachbereicheNav: FachbereichNavEntry[] = [
	{
		label: 'Fachkrankenhäuser',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=363737&rq_MenuGuid=96BDD3EE84338C0AF2E4265DBDE6CF7687EC4F5D',
		items: [
			{
				label: 'Fachklinik für Psychiatrie, Psychosomatik und Psychotherapie in Colditz',
				href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373133&rq_MenuGuid=9CFB03847032F6B8AC0EE2F7736061AA3A8BA029'
			},
			{
				label: 'Fachklinik für Orthopädie in Rothenburg',
				href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373335&rq_MenuGuid=D83A9041B616B4CC9220DEC318F34BCCCCC49019'
			}
		]
	},
	{
		label: 'Reha-Kliniken',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=353838&rq_MenuGuid=CDA8B738B53CE2605FCE93AB9CDF12310547CD86',
		items: [
			{
				label: 'Fachklinik Sonnenhöhe in Bad Elster',
				href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373330&rq_MenuGuid=B9A15DAFB6ECB42EF94784456EA7DD9E96F832A0'
			},
			{
				label: 'Fachklinik Heidehof in Weinböhla',
				href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373339&rq_MenuGuid=68B95322640586AC25B601DB614467A59C5C52DB'
			},
			{
				label: 'Klinik für Rehabilitation / Orthopädie in Rothenburg',
				href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373336&rq_MenuGuid=20313B0BF9E96E57D4B970566A681FE38FCE29B8'
			}
		]
	},
	{
		label: 'Med. Versorgungszentrum',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373134&rq_MenuGuid=2174538AF3F7DA5310706798A3EB0CFB62613A8F',
		items: [
			{
				label: 'MVZ Martin-Ulbrich-Haus',
				href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373333&rq_MenuGuid=3A4C8A1FE5A90EF45D28210DE1A9775932E50CE0'
			},
			{
				label: 'MVZ Landkreis Leipzig',
				href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373334&rq_MenuGuid=DCFFDC5A32E3941439E3BF82F1630B3B0BDCED90'
			}
		]
	},
	{
		label: 'Pflege und Wohnen',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=363634&rq_MenuGuid=1032F3A3771F43654BBF4213DBC39B1B6DD5CA14'
	},
	{
		label: 'Hospizdienst',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=343339&rq_MenuGuid=E1739578DAF9ECBA517F855CB74FBA9302899082'
	},
	{
		label: 'Bildungs- und Tagungsstätte',
		href: 'https://hvhs-kohren-sahlis.de/',
		external: true
	}
];

/** Über uns dropdown. */
export const uberUnsNav: NavLink[] = [
	{
		label: 'Kontakt',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373231&rq_MenuGuid=F058B55022023B587ED0EB2256DF0E7248DD5A0C'
	},
	{
		label: 'Unser Auftrag',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=363734&rq_MenuGuid=CB79366E5BD5BEB3659072A519EA7D6DAA43D680'
	},
	{
		label: 'Wir als Arbeitgeber',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=363930&rq_MenuGuid=7CF52A51B509A3C2D56E7F95FB22D50A688EE663'
	},
	{
		label: 'Qualitätsmanagement',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373232&rq_MenuGuid=B79706AD22D2AD8168D2F0B75F6CB82813FE66CF'
	},
	{
		label: 'Impressum',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373233&rq_MenuGuid=E76846FBDA45BB199B19BD4FB293396BBAB59F63'
	},
	{
		label: 'Datenschutz',
		href: 'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=343432&rq_MenuGuid=04C9F40A5B7EC5A0264B60A62A6EE6912FE5C690'
	}
];

export const newsNavHref =
	'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=306184BD9B7865606538D4D6107C4F951C685A64&rq_TargetPageGuid=7121C63A1814A7ACAFE5DD9E0FFE6E73FE6B90BC&rq_MenuGuid=8415907AE88E5DE9CAEB3F837B23A968D01F7750';

export const traumjobNavHref =
	'https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=C6099B9640F8855AD692222664AA8CF65B259DF7&rq_TargetPageGuid=0AE7221270A4F38B0F1139F6C84B395C8FE40740&rq_MenuGuid=EB8CF777C8CDE182495A8A3F5591DD4B4AB5BDB8';
