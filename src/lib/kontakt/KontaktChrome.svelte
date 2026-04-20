<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let { children }: { children: Snippet } = $props();

	function scrollTopClick() {
		const reduce =
			typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
	}
</script>

<a href="#kontakt-main" class="skip-to-main">Zum Hauptinhalt springen</a>
    <header class="site-header-new">
        <!-- Utility Bar -->



        <div class="header-container">
            <div class="header-content">
                <!-- Logo Area -->
                <div class="logo-area">
                    <a href="https://diakoniestiftung-sachsen.de/"><img src="/logo.png"
                        alt="Diakoniestiftung in Sachsen" class="header-logo-img" width="1091" height="444" decoding="async"></a>
                </div>
                <!-- Navigation Area -->
                <div class="nav-area">
                    <nav class="main-nav">

                        <div class="nav-item">
                            <span class="nav-link">Fachbereiche</span>
                            <span class="chevron" aria-hidden="true"><ChevronDown size={20} strokeWidth={2} /></span>
                            <ul class="nav-dropdown">
                                <li class="nav-dropdown-item">
                                    <a href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=363737&rq_MenuGuid=96BDD3EE84338C0AF2E4265DBDE6CF7687EC4F5D"
                                        class="nav-dropdown-link">Fachkrankenhäuser <span
                                            class="nav-dropdown-arrow" aria-hidden="true"><ChevronRight size={18} strokeWidth={2} /></span></a>
                                    <ul class="nav-submenu">
                                        <li class="nav-dropdown-item"><a
                                                href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373133&rq_MenuGuid=9CFB03847032F6B8AC0EE2F7736061AA3A8BA029"
                                                class="nav-dropdown-link">Fachklinik für Psychiatrie,
                                                Psychosomatik und Psychotherapie in Colditz</a></li>
                                        <li class="nav-dropdown-item"><a
                                                href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373335&rq_MenuGuid=D83A9041B616B4CC9220DEC318F34BCCCCC49019"
                                                class="nav-dropdown-link">Fachklinik für Orthopädie in
                                                Rothenburg</a></li>
                                    </ul>
                                </li>
                                <li class="nav-dropdown-item">
                                    <a href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=353838&rq_MenuGuid=CDA8B738B53CE2605FCE93AB9CDF12310547CD86"
                                        class="nav-dropdown-link">Reha-Kliniken <span
                                            class="nav-dropdown-arrow" aria-hidden="true"><ChevronRight size={18} strokeWidth={2} /></span></a>
                                    <ul class="nav-submenu">
                                        <li class="nav-dropdown-item"><a
                                                href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373330&rq_MenuGuid=B9A15DAFB6ECB42EF94784456EA7DD9E96F832A0"
                                                class="nav-dropdown-link">Fachklinik Sonnenhöhe in Bad
                                                Elster</a></li>
                                        <li class="nav-dropdown-item"><a
                                                href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373339&rq_MenuGuid=68B95322640586AC25B601DB614467A59C5C52DB"
                                                class="nav-dropdown-link">Fachklinik Heidehof in
                                                Weinböhla</a></li>
                                        <li class="nav-dropdown-item"><a
                                                href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373336&rq_MenuGuid=20313B0BF9E96E57D4B970566A681FE38FCE29B8"
                                                class="nav-dropdown-link">Klinik für Rehabilitation /
                                                Orthopädie in Rothenburg</a></li>
                                    </ul>
                                </li>
                                <li class="nav-dropdown-item">
                                    <a href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373134&rq_MenuGuid=2174538AF3F7DA5310706798A3EB0CFB62613A8F"
                                        class="nav-dropdown-link">Med. Versorgungszentrum <span
                                            class="nav-dropdown-arrow" aria-hidden="true"><ChevronRight size={18} strokeWidth={2} /></span></a>
                                    <ul class="nav-submenu">
                                        <li class="nav-dropdown-item"><a
                                                href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373333&rq_MenuGuid=3A4C8A1FE5A90EF45D28210DE1A9775932E50CE0"
                                                class="nav-dropdown-link">MVZ Martin-Ulbrich-Haus</a>
                                        </li>
                                        <li class="nav-dropdown-item"><a
                                                href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373334&rq_MenuGuid=DCFFDC5A32E3941439E3BF82F1630B3B0BDCED90"
                                                class="nav-dropdown-link">MVZ Landkreis Leipzig</a></li>
                                    </ul>
                                </li>
                                <li class="nav-dropdown-item"><a
                                        href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=363634&rq_MenuGuid=1032F3A3771F43654BBF4213DBC39B1B6DD5CA14"
                                        class="nav-dropdown-link">Pflege und Wohnen</a></li>
                                <li class="nav-dropdown-item"><a
                                        href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=343339&rq_MenuGuid=E1739578DAF9ECBA517F855CB74FBA9302899082"
                                        class="nav-dropdown-link">Hospizdienst</a>
                                </li>
                                <li class="nav-dropdown-item"><a href="https://hvhs-kohren-sahlis.de/" target="_blank"
                                        rel="noopener noreferrer" class="nav-dropdown-link">Bildungs- und
                                        Tagungsstätte</a></li>
                            </ul>
                        </div>
                        <div class="nav-item">
                            <span class="nav-link">Über uns</span>
                            <span class="chevron" aria-hidden="true"><ChevronDown size={20} strokeWidth={2} /></span>
                            <ul class="nav-dropdown">
                                <li class="nav-dropdown-item"><a
                                        href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373231&rq_MenuGuid=F058B55022023B587ED0EB2256DF0E7248DD5A0C"
                                        class="nav-dropdown-link">Kontakt</a></li>
                                <li class="nav-dropdown-item"><a
                                        href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=363734&rq_MenuGuid=CB79366E5BD5BEB3659072A519EA7D6DAA43D680"
                                        class="nav-dropdown-link">Unser Auftrag</a>
                                </li>
                                <li class="nav-dropdown-item"><a
                                        href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=363930&rq_MenuGuid=7CF52A51B509A3C2D56E7F95FB22D50A688EE663"
                                        class="nav-dropdown-link">Wir als Arbeitgeber</a></li>
                                <li class="nav-dropdown-item"><a
                                        href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373232&rq_MenuGuid=B79706AD22D2AD8168D2F0B75F6CB82813FE66CF"
                                        class="nav-dropdown-link">Qualitätsmanagement</a></li>
                                <li class="nav-dropdown-item"><a
                                        href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=373233&rq_MenuGuid=E76846FBDA45BB199B19BD4FB293396BBAB59F63"
                                        class="nav-dropdown-link">Impressum</a></li>
                                <li class="nav-dropdown-item"><a
                                        href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=B2713E72CB38D775ED30CEB0144CE8D134C8BE46&rq_TargetPageGuid=423F5C237F16633EC7B12ADF6514E6937EC2B360&rq_RecId=343432&rq_MenuGuid=04C9F40A5B7EC5A0264B60A62A6EE6912FE5C690"
                                        class="nav-dropdown-link">Datenschutz</a></li>
                            </ul>
                        </div>
                        <div class="nav-item">
                            <a href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=306184BD9B7865606538D4D6107C4F951C685A64&rq_TargetPageGuid=7121C63A1814A7ACAFE5DD9E0FFE6E73FE6B90BC&rq_MenuGuid=8415907AE88E5DE9CAEB3F837B23A968D01F7750"
                                class="nav-link">News</a>
                        </div>
                    </nav>
                    <!-- CTA Button -->
                    <a href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=C6099B9640F8855AD692222664AA8CF65B259DF7&rq_TargetPageGuid=0AE7221270A4F38B0F1139F6C84B395C8FE40740&rq_MenuGuid=EB8CF777C8CDE182495A8A3F5591DD4B4AB5BDB8"
                        class="btn-traumjob" style="text-decoration: none;">Traumjob finden</a>
                </div>
            </div>
        </div>
    </header>

    <!-- Breadcrumb -->
    <div id="Container_Breadcrumb" data-id="Container_Breadcrumb">
        <div id="row-breadcrumb" class="ix-grid-row ">
            <div id="col-breadcrumb" class="ix-grid-column ix-small-pLNone ix-small-pRNone ">
                <div id="Action_Breadcrumbtrail" role="navigation">
                    <span id="Header_Action_Breadcrumbtrail" class="Text_H3 hidden">Brotkrümelpfad</span>
                    <nav aria-label="Breadcrumb">
                        <ol id="Action_Breadcrumbtrail_List" data-separator="&gt;">
                            <li><a href="/">Diakoniestiftung in Sachsen</a></li>
                            <li><a href="/info/kontakt">Kontakt</a></li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-bg"></div>
        <div class="hero-content">
            <span class="hero-badge">Kontakt</span>
            <h1 class="hero-title">Lassen Sie uns <br />ins Gespräch kommen</h1>
            <p class="hero-text">
                Haben Sie Fragen zu unseren Einrichtungen oder Karrieremöglichkeiten? Unser Team ist
                gerne für Sie da
                und berät Sie persönlich.
            </p>
        </div>
    </section>

{@render children()}
    <footer class="site-footer-new">
        <div class="footer-main-new">
            <!-- Col 1: Brand & Logo -->
            <div class="footer-col">
                <div class="footer-logo-wrapper">
                    <a href="https://www.diakoniestiftung-sachsen.de/">
                        <img src="/footer_logo.svg" alt="Diakoniestiftung in Sachsen" class="footer-logo-img" width="1134" height="567" decoding="async">
                    </a>
                </div>
                <div class="footer-text footer-address" style="margin-top: 1rem;">
                    Diakoniestiftung in Sachsen<br>
                    Stiftung bürgerlichen Rechts<br>
                    Obere Bergstraße 1<br>
                    01445 Radebeul
                </div>
            </div>

            <!-- Col 2: Info & Address 1 -->
            <div class="footer-col">
                <div class="footer-text footer-address" style="margin-top: 0;">
                    Verwaltungsanschrift:<br>
                    SEG stiftungsentwicklungsgesellschaft mbH<br>
                    Wildparkstraße 3<br>
                    09247 Chemnitz<br>
                    <br>
                    Telefon: <a href="tel:+03722469370" class="footer-contact-link">03722 46937
                        0</a><br>
                    Telefax: 03722 49937 99
                </div>
            </div>

            <!-- Col 3: Links 1 -->
            <div class="footer-col">
                <ul class="footer-links">
                    <li><a class="footer-link"
                            href="https://www.diakoniestiftung-sachsen.de/path/app/?rq_AppGuid=C6099B9640F8855AD692222664AA8CF65B259DF7&amp;rq_TargetPageGuid=0AE7221270A4F38B0F1139F6C84B395C8FE40740&amp;qs_mode=new&amp;qs_page=0AE7221270A4F38B0F1139F6C84B395C8FE40740&amp;qs_reload=0AE7221270A4F38B0F1139F6C84B395C8FE40740">Karriereportal</a>
                    </li>
                    <li><a class="footer-link"
                            href="https://report.hintcatcher.com/yvQM7DSO2Zrb2fTm1Zy4/">Hinweisgebersystem</a>
                    </li>
                </ul>
            </div>

            <!-- Col 4: Links 2 & Copyright -->
            <div class="footer-col" style="display: flex; flex-direction: column; justify-content: space-between;">
                <ul class="footer-links">
                    <li><a class="footer-link" href="https://www.diakoniestiftung-sachsen.de/info/kontakt">Kontakt</a>
                    </li>
                    <li><a class="footer-link"
                            href="https://www.diakoniestiftung-sachsen.de/info/impressum">Impressum</a>
                    </li>
                    <li><a class="footer-link"
                            href="https://www.diakoniestiftung-sachsen.de/info/datenschutz">Datenschutz</a>
                    </li>
                </ul>
                <div class="footer-text" style="font-size: 0.75rem; margin-top: 3rem;">
                    © {new Date().getFullYear()} Diakoniestiftung in Sachsen
                </div>
            </div>
        </div>

        <div class="donation-bar">
            <div class="donation-container">
                <div class="donation-col">
                    <div style="font-size: 0.8125rem;">Spendenkonto der Diakoniestiftung in<br>Sachsen
                    </div>
                </div>

                <div class="donation-col"
                    style="font-size: 0.8125rem; display: flex; flex-direction: column; gap: 0.25rem;">
                    <div>IBAN: DE41 8602 0500 0003 6550 02</div>
                    <div>BIC: BFSWDE33LPZ</div>
                </div>
            </div>

            <div class="donation-center-btn">
                <button type="button" class="scroll-up-btn" aria-label="Nach oben scrollen" onclick={scrollTopClick}>
                    <ArrowUp size={24} strokeWidth={2} aria-hidden="true" />
                </button>
            </div>
        </div>
    </footer>


<style>
	.skip-to-main {
		position: absolute;
		left: -9999px;
		z-index: 9999;
		padding: 0.75rem 1rem;
		background: #1a1a2e;
		color: #fff;
		text-decoration: none;
		border-radius: 4px;
	}
	.skip-to-main:focus {
		left: 0.5rem;
		top: 0.5rem;
		outline: 2px solid #fff;
		outline-offset: 2px;
	}
</style>
