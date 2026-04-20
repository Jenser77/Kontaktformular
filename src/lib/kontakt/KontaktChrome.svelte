<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import {
		fachbereicheNav,
		newsNavHref,
		traumjobNavHref,
		uberUnsNav,
		type FachbereichNavEntry,
		type NavGroupItem
	} from '$lib/kontakt/navigation';

	let { children }: { children: Snippet } = $props();

	function hasSubmenu(entry: FachbereichNavEntry): entry is NavGroupItem {
		return 'items' in entry && Array.isArray(entry.items);
	}

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
								{#each fachbereicheNav as entry (`${entry.label}-${entry.href}`)}
									<li class="nav-dropdown-item">
										{#if hasSubmenu(entry)}
											<a href={entry.href} class="nav-dropdown-link"
												>{entry.label}
												<span class="nav-dropdown-arrow" aria-hidden="true"
													><ChevronRight size={18} strokeWidth={2} /></span
												></a
											>
											<ul class="nav-submenu">
												{#each entry.items as sub (sub.href)}
													<li class="nav-dropdown-item">
														<a href={sub.href} class="nav-dropdown-link">{sub.label}</a>
													</li>
												{/each}
											</ul>
										{:else}
											<a
												href={entry.href}
												class="nav-dropdown-link"
												target={entry.external ? '_blank' : undefined}
												rel={entry.external ? 'noopener noreferrer' : undefined}>{entry.label}</a
											>
										{/if}
									</li>
								{/each}
                            </ul>
                        </div>
                        <div class="nav-item">
                            <span class="nav-link">Über uns</span>
                            <span class="chevron" aria-hidden="true"><ChevronDown size={20} strokeWidth={2} /></span>
                            <ul class="nav-dropdown">
								{#each uberUnsNav as link (link.href)}
									<li class="nav-dropdown-item">
										<a href={link.href} class="nav-dropdown-link">{link.label}</a>
									</li>
								{/each}
                            </ul>
                        </div>
                        <div class="nav-item">
                            <a href={newsNavHref} class="nav-link">News</a>
                        </div>
                    </nav>
                    <!-- CTA Button -->
                    <a href={traumjobNavHref} class="btn-traumjob" style="text-decoration: none;">Traumjob finden</a>
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
