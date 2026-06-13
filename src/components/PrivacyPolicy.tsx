import React from "react";
import { ArrowLeft, Shield, Clock, FileText, Globe, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

interface PrivacyPolicyProps {
  onBackToHome: () => void;
}

export function PrivacyPolicy({ onBackToHome }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-neutral-800 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto bg-white border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-brand-green text-white p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
            <Shield className="w-96 h-96" />
          </div>
          <button 
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-green-100 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full mb-6 font-bold uppercase tracking-wider cursor-pointer active:scale-95 duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight uppercase">
            Privacy Policy
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-green-100">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Last updated: March 19th, 2024
            </span>
            <span className="flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-full text-white font-semibold">
              Live & Active
            </span>
          </div>
        </div>

        {/* Policy Body */}
        <div className="p-6 sm:p-10 space-y-8 leading-relaxed text-sm text-neutral-600">
          
          {/* Section: Introduction */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">1</span>
              Introduction to Privacy Policy
            </h2>
            <p>
              This privacy policy (the <strong>"Privacy Policy"</strong>) applies to your use of the website of Razorpay hosted
              at <strong>razorpay.com</strong>, the Services (as defined under the Razorpay "Terms of Use") and Razorpay applications on
              mobile platforms (Android, Blackberry, Windows Phone, iOS etc.) (collectively (<strong>"RAZORPAY"</strong> or <strong>"WEBSITE"</strong>)), but does not apply to any third party websites that may be linked to them, or any relationships
              you may have with the businesses listed on Razorpay.
            </p>
            <p>
              The terms <strong>"we"</strong>, <strong>"our"</strong> and <strong>"us"</strong> refer to <strong>Razorpay</strong> and the terms <strong>"you"</strong>, <strong>"your"</strong> and <strong>"User"</strong> refer to you, as a
              user of <strong>Razorpay</strong>. The term <strong>"Personal Information"</strong> means information that you provide to us which
              personally identifies you to be contacted or identified, such as your name, phone number, email address, and
              any other data that is tied to such information. Our practices and procedures in relation to the collection and
              use of Personal Information have been set-out below in order to ensure safe usage of the Website for you.
            </p>
            <p>
              We have implemented reasonable security practices and procedures that are commensurate with the
              information assets being protected and with the nature of our business. While we try our best to provide
              security that is better than the industry standards, because of the inherent vulnerabilities of the internet, we
              cannot ensure or warrant complete security of all information that is being transmitted to us by you. By
              visiting this Website, you agree and acknowledge to be bound by this Privacy Policy and you hereby consent
              that we will collect, use, process and share your Personal Information in the manner set out herein below. If
              you do not agree with these terms, do not use the Website.
            </p>
            <p>
              It is clarified that the terms and conditions that are provided separately, form an integral part of your use of
              this Website and should be read in conjunction with this Privacy Policy.
            </p>
          </section>

          {/* Section: Information collection */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">2</span>
              Information we collect and how we use it
            </h2>
            <p>
              We collect, receive and store your Personal Information. If you provide your third-party account credentials
              (<strong>"Third Party Account Information"</strong>) to us, you understand that some content and information in those
              accounts may be transmitted to your account with us if you authorise such transmissions and that Third Party
              Account Information transmitted to us shall be covered by this Privacy Policy. You may opt to not provide us
              with certain information, however that will restrict you from registering with us or availing some of our
              features and services.
            </p>
            <p>
              We use commercially reasonable efforts to ensure that the collection of Personal Information is limited to that
              which is necessary to fulfill the purposes identified below. If we use or plan to use your information in a
              manner different than the purpose for which it is collected, then we will ask you for your consent prior to
              such use.
            </p>
            <p>
              The Personal Information collected will be used only for the purpose of enabling you to use the services
              provided by us, to help promote a safe service, calibrate consumer interest in our products and services,
              inform you about online offers and updates, troubleshoot problems, customize User experience, detect and
              protect us against error, fraud and other criminal activity, collect money, enforce our terms and conditions,
              and as otherwise described to you at the time of collection of such information.
            </p>
          </section>

          {/* Section: Merchant Account Info */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">3</span>
              Account information of Merchants
            </h2>
            <p>
              If you create an account to take advantage of the full range of services offered on Razorpay, we ask for and
              record Personal Information such as your name, email address and mobile number. We may collect and store
              your Sensitive Personal Data or Information (such as any financial information including inter alia credit
              card, debit card details, bank account and know your customer (<strong>"KYC"</strong>) documents as per RBI regulations and any other information as may be applicable) that the User may opt to save in the User account created
              with Razorpay]. We use your email address to send you updates, news, and newsletters (if you willingly
              subscribe to the newsletter during signup, or anytime after signup) and contact you on behalf of other Users
              (such other Users who send you friend requests, personal messages, or other social collaboration based
              events). If you do not want to receive communications from us that are not relevant to you or your use of our
              services, please click on the unsubscribe link provided at the bottom of such e-mails sent to you by us. We use
              your mobile numbers to send you transaction alerts and SMS alerts based on your preferences. If you do not
              wish to receive such SMSs from us, please notify us at <strong>razorpay.com/support</strong> to stop receiving SMSs from us.
              Razorpay assures that your Personal Information will not be made public or sold to any third party.
            </p>
            <p>
              The User shall have an option to erase any information provided by the User including Personal Information.
              If a User opts for the said option of erasure, Razorpay shall delete all stored information of the User from its
              servers.
            </p>
          </section>

          {/* Section: Customer Info */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">4</span>
              Customer Information
            </h2>
            <p>
              We also store customer information of customers such as address, mobile number, Third Party Wallet details,
              Card Details and email address making payments through Razorpay checkouts. However, only when
              customer chooses to share the information on the businesses powered with Razorpay applications we share
              the information to respective businesses. However, Razorpay is not liable in any way for any misuse of this
              information by the business or people related to the businesses to whom the information is shared by the
              customer.
            </p>
          </section>

          {/* Section: Activity */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">5</span>
              Activity & IP Rights
            </h2>
            <p>
              We record information relating to your use of Razorpay, such as the searches you undertake, the pages you
              view, your browser type, IP address, location, requested URL, referring URL, and timestamp information. We
              use this type of information to administer Razorpay and provide the highest possible level of security and
              service to you. We also use this information in the aggregate to perform statistical analyses of User behavior
              and characteristics in order to measure interest in and use of the various areas of Razorpay. However, you
              cannot be identified from this aggregate information.
            </p>
            <p>
              We own all the intellectual property rights associated with the Website and its contents. No right, title or
              interest in any downloaded material is transferred to you as a result of any such downloading or copying. The
              Website is protected by copyright as a collective work and/ or compilation (meaning the collection,
              arrangement, and assembly) of all the content on this Website, pursuant to applicable law.
            </p>
            <p>
              Our logos, product and service marks and/ or names, trademarks, copyrights and other intellectual property,
              whether registered or not (<strong>"Our IP"</strong>) are exclusively owned by us. Without our prior written permission, you
              agree to not display and/ or use Our IP in any manner. Nothing contained in this Website or the content,
              should be construed as granting, in any way to the User, any license or right or interest whatsoever, in and/ or
              to Our IP, without our express written permission.
            </p>
          </section>

          {/* Section: Cookies */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">6</span>
              Cookies
            </h2>
            <p>
              We send cookies to your computer in order to uniquely identify your browser and improve the quality of our
              service. The term <strong>"cookies"</strong> refers to small pieces of information that a website sends to your computer's hard
              drive while you are viewing the site. We may use both session cookies (which expire once you close your
              browser) and persistent cookies (which stay on your computer until you delete them). Persistent cookies can
              be removed by following your browser help file directions. If you choose to disable cookies, some areas of
              Razorpay may not work properly or at all. Razorpay uses third party tools, who may collect anonymous
              information about your visits to Razorpay using cookies, and interaction with Razorpay products and
              services. Such third parties may also use information about your visits to Razorpay products and services and
              other web sites to target advertisements for Razorpay's products and services. No Personal Information is
              collected or used in this process. These third parties do not know or have access to the name, phone number,
              address, email address, or any Personal Information about Razorpay's Users. Razorpay Users can opt-out of
              sharing this information with third parties by deactivating cookies, the process of which varies from browser
              to browser. Please refer to the help file of your browser to understand the process of deactivating cookies on
              your browser.
            </p>
          </section>

          {/* Section: Enforcement */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">7</span>
              Enforcement
            </h2>
            <p>
              We may use the information we collect in connection with your use of Razorpay (including your Personal
              Information) in order to investigate, enforce, and apply our terms and conditions and Privacy Policy.
            </p>
          </section>

          {/* Section: Transfer of Info */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">8</span>
              Transfer of Information
            </h2>
            <p>
              We do not share your Personal Information with any third party apart from financial institutions such as
              banks, RBI or other regulatory agencies (as may be required) and to provide you with services that we offer
              through Razorpay, conduct quality assurance testing, facilitate creation of accounts, provide technical and
              customer support, or provide specific services, such as synchronization of your contacts with other software
              applications, in accordance with your instructions. These third parties are required not to use your Personal
              Information other than to provide the services requested by you.
            </p>
            <p>
              We may share your Personal Information with our parent company, subsidiaries, joint ventures, or other
              companies under a common control (collectively, the <strong>"Affiliates"</strong>) that we may have now or in the future, in
              which case we will require them to honor this Privacy Policy. If another company acquires our company or
              our assets, that company will possess your Personal Information, and will assume the rights and obligations
              with respect to that information as described in this Privacy Policy. We may disclose your Personal
              Information to third parties in a good faith belief that such disclosure is reasonably necessary to (a) take
              action regarding suspected illegal activities; (b) enforce or apply our terms and conditions and Privacy Policy;
              (c) comply with legal process, such as a search warrant, subpoena, statute, or court order; or (d) protect our
              rights, reputation, and property, or that of our Users, Affiliates, or the public. Please note that we are not
              required to question or contest the validity of any search warrant, subpoena or other similar governmental
              request that we receive.
            </p>
            <p>
              We may disclose information in the aggregate to third parties relating to User behavior in connection with
              actual or prospective business relationship with those third parties, such as advertisers and content
              distributors. For example, we may disclose the number of Users that have been exposed to, or clicked on,
              advertising banners.
            </p>
          </section>

          {/* Section: Links */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">9</span>
              Links
            </h2>
            <p>
              References on this Website to any names, marks, products or services of third parties or hyperlinks to third
              party websites or information are provided solely for your convenience and do not in any way constitute or
              imply our endorsement, sponsorship or recommendation of the third party, information, product or service.
              Except as set forth herein, we do not share your Personal Information with those third parties, and are not
              responsible for their privacy practices. We suggest you read the privacy policies on all such third party
              websites.
            </p>
          </section>

          {/* Section: User access */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">10</span>
              User Access of Personal Information
            </h2>
            <p>
              As a registered Razorpay User, you can modify some of your Personal Information and your privacy
              preferences by accessing the "Account" section of this Website.
            </p>
          </section>

          {/* Section: Security */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">11</span>
              Security
            </h2>
            <p>
              Your account is password protected. We use industry standard measures to protect the Personal Information
              that is stored in our database. We follow industry standard best practices on Information Security, as also
              mentioned in our website. We limit the access to your Personal Information to those employees and
              contractors who need access to perform their job function, such as our customer service personnel. If you
              have any questions about the security on Razorpay, please contact us at <strong>disclosures@razorpay.com</strong>.
            </p>
            <p>
              You hereby acknowledge that Razorpay is not responsible for any intercepted information sent via the
              internet, and you hereby release us from any and all claims arising out of or related to the use of intercepted
              information in any unauthorized manner.
            </p>
          </section>

          {/* Section: Terms and modification */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">12</span>
              Terms and Modifications to this Privacy Policy
            </h2>
            <p>
              Our Privacy Policy is subject to change at any time without notice. To make sure you are aware of any
              changes, please review this policy periodically. These changes will be effective immediately on the Users of
              Razorpay. Please note that at all times you are responsible for updating your Personal Information, including
              to provide us with your most current e-mail address.
            </p>
            <p>
              If you do not wish to permit changes in our use of your Personal Information, you must notify us promptly
              that you wish to deactivate your account with us. Continued use of Razorpay after any change/ amendment to
              this Privacy Policy shall indicate your acknowledgement of such changes and agreement to be bound by the
              terms and conditions of such changes.
            </p>
          </section>

          {/* Section: Applicable Law */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">13</span>
              Applicable Law
            </h2>
            <p>
              Your use of this Website will be governed by and construed in accordance with the laws of India. The Users
              agree that any legal action or proceedings arising out of your use may be brought exclusively in the
              competent courts/ tribunals having jurisdiction in Bengaluru in India and irrevocably submit themselves to
              the jurisdiction of such courts/ tribunals.
            </p>
          </section>

          {/* Section: Complaints and Grievance */}
          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="bg-green-50 text-brand-green w-6 h-6 rounded flex items-center justify-center text-xs font-bold">14</span>
              Complaints and Grievance Redressal
            </h2>
            <p>
              If you contact us to provide feedback, register a complaint, or ask a question, we will record any Personal
              Information and other content that you provide in your communication so that we can effectively respond to
              your communication. Any complaints or concerns in relation to your Personal Information or content of this
              Website or any dispute or breach of confidentiality or any proprietary rights of User during use of the Website
              or any intellectual property of any User should be immediately informed to the Grievance cum Nodal Officer
              at the co-ordinates mentioned below in writing or by way of raising a grievance ticket through the hyperlink
              mentioned below:
            </p>
            
            <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-5 space-y-3 font-medium text-xs text-neutral-700">
              <span className="text-[10px] font-extrabold text-brand-green block tracking-wider uppercase">DPO CONTACT CO-ORDINATES</span>
              <div>
                <p className="font-extrabold text-neutral-900">Mr. SHASHANK KARINCHETI</p>
                <p className="text-neutral-500">Razorpay Software Private Limited</p>
              </div>
              <div className="space-y-1 pt-1 border-t border-neutral-200/60">
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-neutral-400" /> No. 22, 1st Floor, SJR Cyber, Laskar - Hosur Road, Adugodi, Bangalore - 560030</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-neutral-400" /> 080-46669555</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-neutral-400" /> dpo@razorpay.com</p>
                <p className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-neutral-400" /> Grievance portal: <a href="https://razorpay.com/grievances/" target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">https://razorpay.com/grievances/</a></p>
              </div>
            </div>
          </section>

          {/* Section: Acceptance Details */}
          <section className="pt-6 border-t border-neutral-200">
            <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-brand-green" />
              Acceptance Details
            </h2>
            <div className="bg-green-50/60 border border-brand-green/20 rounded-xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-neutral-700">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-green/80 uppercase block tracking-wider">Owner ID</span>
                <span className="font-mono text-neutral-900">T0qgD1AX4FcuZe</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-green/80 uppercase block tracking-wider">Owner Name</span>
                <span className="text-neutral-900 font-bold">AFSAL KUNHI KANDY</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-green/80 uppercase block tracking-wider">IP Address Of Signing</span>
                <span className="font-mono text-neutral-900">103.209.133.83</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-green/80 uppercase block tracking-wider">Date & Time of Acceptance</span>
                <span className="text-neutral-900 font-bold">2026-06-13 01:59:42 IST</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-green/80 uppercase block tracking-wider">Signatory Name</span>
                <span className="text-neutral-900 font-bold">AFSAL KUNHI KANDY</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-brand-green/80 uppercase block tracking-wider">Contact Number</span>
                <span className="text-neutral-900 font-bold">+917204995421</span>
              </div>
              <div className="space-y-1 sm:col-span-2 border-t border-brand-green/10 pt-2.5 mt-1.5 flex flex-wrap items-center justify-between gap-2 text-brand-green">
                <div>
                  <span className="text-[9px] font-black text-brand-green/80 uppercase block tracking-wider">Registered Email Address</span>
                  <a href="mailto:kalyanirestaurentbangalore@gmail.com" className="font-bold underline hover:text-brand-green/80">kalyanirestaurentbangalore@gmail.com</a>
                </div>
                <div className="text-right">
                  <span className="text-[8px] bg-brand-green/10 text-brand-green py-1 px-2 rounded font-black uppercase tracking-wider block">Signed via Razorpay APIs</span>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-neutral-400 mt-4 leading-relaxed">
              This policy constitutes a legal, digital binding contract accepted by Afsal Kunhi Kandy on behalf of Kalyani Restaurant, hosted securely under official domain register <a href="https://www.kalyanirestaurent.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-600">https://www.kalyanirestaurent.online</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
