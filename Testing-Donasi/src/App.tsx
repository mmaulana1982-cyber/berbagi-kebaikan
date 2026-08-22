/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppSettings, Campaign, Disbursement, Donation, DonorPrayer } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DonationModal } from './components/DonationModal';
import { ZakatCalculatorModal } from './components/ZakatCalculatorModal';
import { WhatsAppSupportPopup } from './components/WhatsAppSupportPopup';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { HomePage } from './pages/HomePage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { TransparencyPage } from './pages/TransparencyPage';
import { PrayersPage } from './pages/PrayersPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { syncFaviconAndPwaManifest } from './services/imageOptimizer';
import { updateSocialShareMetaTags } from './services/socialMetaHelper';

export default function App() {
  // Master State
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => storageService.getCampaigns());
  const [donations, setDonations] = useState<Donation[]>(() => storageService.getDonations());
  const [disbursements, setDisbursements] = useState<Disbursement[]>(() => storageService.getDisbursements());
  const [prayers, setPrayers] = useState<DonorPrayer[]>(() => storageService.getPrayers());

  // Routing State
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Detect shared campaign from URL parameter on initial load or popstate
  useEffect(() => {
    const handleUrlRoute = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const campaignIdParam = urlParams.get('campaign');
      const hash = window.location.hash;
      const hashCampaignId = hash.startsWith('#campaign-') ? hash.replace('#campaign-', '') : null;

      const targetId = campaignIdParam || hashCampaignId;
      if (targetId) {
        const found = campaigns.find(c => c.id === targetId);
        if (found) {
          setSelectedCampaign(found);
          setActivePage('campaign-detail');
          return;
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [campaigns]);

  // Synchronize Open Graph & Twitter Card photo previews dynamically whenever campaign changes
  useEffect(() => {
    updateSocialShareMetaTags(selectedCampaign, settings);
  }, [selectedCampaign, settings]);

  // Modals
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [donationTargetCampaign, setDonationTargetCampaign] = useState<Campaign | null>(null);
  const [isZakatModalOpen, setIsZakatModalOpen] = useState<boolean>(false);

  // Refresh data from storage
  const handleRefreshData = () => {
    setSettings(storageService.getSettings());
    setCampaigns(storageService.getCampaigns());
    setDonations(storageService.getDonations());
    setDisbursements(storageService.getDisbursements());
    setPrayers(storageService.getPrayers());
  };

  // Scroll to top when activePage changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, selectedCampaign]);

  // Synchronize Favicon, Apple Touch Icon & PWA Web App Manifest dynamically
  useEffect(() => {
    syncFaviconAndPwaManifest(settings);
  }, [settings]);

  // Open Donate Modal for specific campaign
  const handleOpenDonate = (campaign: Campaign) => {
    setDonationTargetCampaign(campaign);
    setIsDonationModalOpen(true);
  };

  // Quick donate from navbar (picks featured or first campaign)
  const handleQuickDonate = () => {
    const target = campaigns.find(c => c.isFeatured) || campaigns[0];
    if (target) {
      handleOpenDonate(target);
    }
  };

  // View Campaign Details
  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setActivePage('campaign-detail');
    // Update browser URL so if the link is copied from address bar, it includes the campaign ID
    const newUrl = `${window.location.origin}${window.location.pathname}?campaign=${encodeURIComponent(campaign.id)}`;
    window.history.pushState({ campaignId: campaign.id }, '', newUrl);
  };


  // Like Prayer Action
  const handleToggleLikePrayer = (prayerId: string) => {
    storageService.toggleLikePrayer(prayerId);
    setPrayers(storageService.getPrayers());
  };

  // From Zakat Calculator to Donation Flow
  const handleSelectZakatAmount = (amount: number, note: string) => {
    const generalCampaign = campaigns.find(c => c.category === 'yatim-dhuafa' || c.category === 'wakaf') || campaigns[0];
    if (generalCampaign) {
      setDonationTargetCampaign(generalCampaign);
      setIsDonationModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Top Navbar (1 Row 3-Zone Contract) */}
      <Navbar
        settings={settings}
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          if (page !== 'campaign-detail') {
            setSelectedCampaign(null);
            if (window.location.search || window.location.hash) {
              window.history.pushState({}, '', window.location.pathname);
            }
          }
        }}
        onOpenQuickDonate={handleQuickDonate}
        onOpenZakatCalc={() => setIsZakatModalOpen(true)}
        onOpenAdmin={() => {
          setActivePage('admin');
          setSelectedCampaign(null);
          if (window.location.search || window.location.hash) {
            window.history.pushState({}, '', window.location.pathname);
          }
        }}
      />


      {/* Main Page Routing */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            settings={settings}
            campaigns={campaigns}
            disbursements={disbursements}
            prayers={prayers}
            onSelectCampaign={handleSelectCampaign}
            onDonateCampaign={handleOpenDonate}
            onViewAllCampaigns={() => setActivePage('campaigns')}
            onViewTransparency={() => setActivePage('transparency')}
            onViewPrayers={() => setActivePage('prayers')}
            onToggleLikePrayer={handleToggleLikePrayer}
            onOpenZakatCalc={() => setIsZakatModalOpen(true)}
          />
        )}

        {activePage === 'campaigns' && (
          <CampaignsPage
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onDonateCampaign={handleOpenDonate}
          />
        )}

        {activePage === 'campaign-detail' && selectedCampaign && (
          <CampaignDetailPage
            campaign={selectedCampaign}
            donations={donations}
            prayers={prayers}
            onBack={() => setActivePage('campaigns')}
            onDonate={handleOpenDonate}
            onToggleLikePrayer={handleToggleLikePrayer}
          />
        )}

        {activePage === 'transparency' && (
          <TransparencyPage
            campaigns={campaigns}
            disbursements={disbursements}
            onSelectCampaign={handleSelectCampaign}
          />
        )}

        {activePage === 'prayers' && (
          <PrayersPage
            prayers={prayers}
            onToggleLikePrayer={handleToggleLikePrayer}
            onOpenQuickDonate={handleQuickDonate}
          />
        )}

        {activePage === 'about' && (
          <AboutPage
            settings={settings}
            onOpenQuickDonate={handleQuickDonate}
          />
        )}

        {activePage === 'admin' && (
          <AdminPage
            settings={settings}
            campaigns={campaigns}
            donations={donations}
            disbursements={disbursements}
            onRefreshData={handleRefreshData}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        setActivePage={(page) => {
          setActivePage(page);
          if (page !== 'campaign-detail') setSelectedCampaign(null);
        }}
        onOpenZakatCalc={() => setIsZakatModalOpen(true)}
        onOpenAdmin={() => {
          setActivePage('admin');
          setSelectedCampaign(null);
        }}
      />

      {/* Interactive Donation Checkout Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        campaign={donationTargetCampaign}
        onClose={() => setIsDonationModalOpen(false)}
        onDonationComplete={() => {
          handleRefreshData();
        }}
      />

      {/* Zakat & Wakaf Calculator Modal */}
      <ZakatCalculatorModal
        isOpen={isZakatModalOpen}
        onClose={() => setIsZakatModalOpen(false)}
        onSelectAmountForDonation={handleSelectZakatAmount}
      />

      {/* WhatsApp Interactive Support Popup (configured in Admin) */}
      <WhatsAppSupportPopup
        settings={settings}
      />

      {/* PWA Progressive Web App Install Banner & Prompt (Muncul 30 Detik di Beranda) */}
      <PwaInstallPrompt
        settings={settings}
        activePage={activePage}
      />

    </div>
  );
}
