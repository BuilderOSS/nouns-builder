import { Box, Heading, Label, Paragraph, Text } from '@buildeross/zord'
import Head from 'next/head'
import React from 'react'

import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { legalContainer } from 'src/styles/legal.css'

import { NextPageWithLayout } from './_app'

const LegalPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Nouns Builder | Legal</title>
      </Head>

      <main>
        <Box as="article" py="x8" className={legalContainer}>
          <header>
            <Box>
              <Heading size="sm" mb="x2">
                Nouns Builder Terms of Service
              </Heading>

              <Text>Last Updated: August 24, 2023</Text>
            </Box>
          </header>

          <Box as="section" mt="x4">
            <Paragraph>
              <Text display="inline">Thank you for using Nouns Builder (</Text>
              <Text
                as="a"
                rel="noreferrer noopener"
                target="_blank"
                display="inline"
                href="https://nouns.build"
              >
                https://nouns.build/
              </Text>
              <Text display="inline">
                ) and Nouns Connect (
                <Text
                  target="_blank"
                  rel="noreferrer noopener"
                  as="a"
                  display="inline"
                  href="https://www.nounsconnect.wtf/"
                >
                  https://www.nounsconnect.wtf/
                </Text>
                ), collectively a hosted user interface (the “Interface” or “App”) offered
                by Zora Labs, Inc. (“Zora”, “we”, “us”, or “our”) that provides access to
                the decentralized and open-source Builder Protocol (“Protocol”). The
                Protocol allows users to create and deploy Decentralized Autonomous
                Organizations (“DAOs”) adopting technical, structural, and governance
                characteristics modeled after the NounsDAO. The Interface provides one
                method for accessing the Protocol, but it is not the only way to do so.
                The underlying code for the Nouns Builder interface is also open source
                and available at{' '}
                <Text
                  target="_blank"
                  rel="noreferrer noopener"
                  as="a"
                  display="inline"
                  href="https://github.com/ourzora/nouns-builder"
                >
                  https://github.com/ourzora/nouns-builder
                </Text>
              </Text>
            </Paragraph>

            <Paragraph mt="x2">
              These Terms of Service (“Terms”) outline the conditions by which you may
              access and use the Interface. Please read these Terms carefully. You agree
              that by accessing or using the Interface, you signify that you have read,
              understand, and agree to be bound by all of these Terms. If you do not
              agree, you are not authorized to access or use the Interface and must
              discontinue use immediately.
            </Paragraph>

            <Paragraph mt="x2">
              <Text fontWeight="display">
                Please be aware that these Terms include provisions governing how to
                resolve disputes between you and Zora, including a binding arbitration
                provision and a class action waiver. Please read these provisions
                carefully.
              </Text>
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Eligibility</Label>

            <Paragraph mt="x2">
              You are not permitted to access the Interface if you engage in any activity
              in violation of regulations administered by the US Foreign Asset Control or
              any other relevant sanctions authorities. This includes if you: (a) are or
              are acting on behalf of any other person who is (or if you are an entity,
              you are owned or controlled by any other person who is), identified on any
              list of prohibited parties, including the U.S. Treasury Department’s
              Specially Designated Nationals list and Foreign Sanctions Evaders list; or
              (b) are located, ordinarily resident, organized, established, or domiciled
              in a jurisdiction that is subject to a comprehensive U.S. embargo.
            </Paragraph>

            <Paragraph mt="x2">
              You must not use any software or networking techniques, including use of a
              Virtual Private Network (VPN) to modify your internet protocol address or
              otherwise circumvent or attempt to circumvent this prohibition.
            </Paragraph>

            <Paragraph mt="x2">
              You must be at least 18 years of age to use the Interface. If you are under
              18 but at least 13 years old, you may only use the Interface through a
              parent or guardian’s account and with their approval and oversight.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Terms Updates and Modifications</Label>

            <Paragraph mt="x2">
              We reserve the right, in our sole discretion, to make changes or
              modifications to these Terms at any time and for any reason. We will alert
              you about any changes by updating the “Last updated” date of these Terms,
              and you waive any right to receive specific notice of each such change. It
              is your responsibility to periodically review these Terms to stay informed
              of updates. You will be subject to, and will be deemed to have been made
              aware of and to have accepted, the changes in any revised Terms by your
              continued use of the Interface after the date such revised Terms are posted.
              If you do not agree with any modifications to these Terms, you must
              immediately stop accessing and using the Interface.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Services Provided by the Interface</Label>

            <Label italic mt="x2">
              Interface
            </Label>

            <Paragraph mt="x2">
              The Interface is distinct from the Protocol and simply provides a means for
              accessing the Protocol. The Protocol is comprised of a set of smart
              contracts deployed on various public blockchains (each a “Supported
              Network”), including but not limited to Ethereum, which allow users to
              create and deploy Nouns-model DAOs. The Protocol is maintained by Builder
              DAO and the Builder developer community. Zora does not control or operate
              the Protocol. Rather, the Interface simplifies interaction with the Protocol
              to provide a user-friendly method to create and manage DAOs through the
              Protocol. Specifically:
            </Paragraph>
            <Box>
              <ul>
                <li>
                  <Box mt="x2">
                    <Text display="inline">
                      Nouns Builder allows creators to easily generate a Nouns-style DAO
                      with the user’s preferred characteristics and attributes and
                      utilizing the Interface’s DAO governance features, while
                    </Text>
                  </Box>
                </li>
                <li>
                  <Box mt="x2">
                    <Text display="inline">
                      Nouns Connect is a tool that allows DAOs to easily connect a
                      Nouns-style DAO’s treasury to decentralized applications (“Dapps”)
                      to more efficiently and effectively perform on-chain operations.
                    </Text>
                  </Box>
                </li>
              </ul>
            </Box>

            <Paragraph mt="x2">
              In order to access certain functionality, you must connect third party
              non-custodial wallet software (a “Wallet”) to the Interface. By connecting a
              Wallet to the Interface, you agree to abide by the terms and conditions of
              the applicable Wallet provider. We do not provide a Wallet service and do
              not at any time have custody, possession, or control over your NFTs, digital
              assets, or any other contents in your Wallet.
            </Paragraph>

            <Label italic mt="x2">
              Bridge
            </Label>

            <Paragraph mt="x2">
              Deployments on other blockchain networks typically rely on a series of smart
              contracts to transfer crypto assets from one blockchain network to another.
              As a result, before you are able to use the Protocol or the Services via a
              Supported Network other than Ethereum, you may need to “bridge” the crypto
              assets held within your Wallet on the Ethereum blockchain to the Supported
              Network that you intend to utilize. This process is known as “bridging” and
              the smart contracts that permit bridging are each known as a “bridge.”
            </Paragraph>

            <Paragraph mt="x2">
              Crypto assets that have not been bridged to a Supported Network cannot be
              used in transactions on such Supported Network. Similarly, crypto assets
              that have been bridged to a Supported Network cannot be used in transactions
              on the Ethereum blockchain until such crypto assets have been “withdrawn”
              (this process is known as “withdrawing”) from the Supported Network. The
              crypto assets that you bridge to a Supported Network will appear in your
              Wallet on the Supported Network, but will not appear in your Wallet on the
              Ethereum blockchain.
            </Paragraph>

            <Paragraph mt="x2">
              If you attempt to bridge any crypto assets that are not supported by a
              bridge designed for a Supported Network, you may destroy or irretrievably
              lose access to such crypto assets. You own, control, and are responsible for
              all crypto assets held in and bridged via your Wallet and Zora is not liable
              or responsible for any crypto assets that are destroyed or irretrievably
              lost by users through the bridging and withdrawing process.
            </Paragraph>

            <Paragraph mt="x2">
              The Services include a bridge (the “Builder Bridge”) that permits users to
              transfer crypto assets from Ethereum to Supported Networks built on the OP
              Stack, available to the public at
              https://github.com/ethereum-optimism/optimism (collectively “OP Stack
              Networks”).
            </Paragraph>

            <Paragraph mt="x2">
              THE BUILDER BRIDGE ONLY ALLOWS USERS TO BRIDGE (I.E. SEND) FUNDS FROM THE
              ETHEREUM NETWORK TO AN OP STACK NETWORK. YOU CANNOT USE THE BUILDER BRIDGE
              TO WITHDRAW FUNDS FROM OP STACK NETWORKS TO ETHEREUM MAINNET.
            </Paragraph>

            <Paragraph mt="x2">
              Third-party developers may release third-party bridges that allow users to
              bridge crypto assets, from the Ethereum blockchain to and from OP Stack
              Networks (“Third-Party Bridges”). Third-Party Bridges may allow you to: 1)
              withdraw funds from OP Stack Networks to Ethereum Mainnet; and 2) access
              your crypto assets at a faster rate than the Builder Bridge as Third-Party
              Bridges may offer different deposit times. Third-Party Bridges may also
              charge you additional or different transaction or “gas” fees than the
              Builder Bridge. You must exercise caution when accessing and using
              Third-Party Bridges. Once your crypto assets are locked in a Third-Party
              Bridge, control over such Third-Party Bridge is typically with the
              third-party developer or the smart contract itself. At no point in time will
              we be liable to you for any loss involving a Third-Party Bridge, have the
              ability to exercise control over any Third Party Bridge, or assist you if
              your crypto assets get locked in a Third-Party Bridge. The applicable
              service provider for the Third-Party Bridge is solely responsible for the
              crypto assets you use in connection with a Third-Party Bridge and any
              transaction that is facilitated via such Third-Party Bridge whether
              successful, incomplete, subject to dispute, or otherwise.
            </Paragraph>

            <Paragraph mt="x2">
              Warning. Zora does not make any representation or warranty or approve of
              your use of any Third-Party Bridges software or other products
              (collectively, “Third-Party Products”) as such products are developed
              independent of Zora by third parties. Zora does not and will never assume
              responsibility for any of the Third-Party Products or the losses or damages
              that may result therefrom. Your use of any Third-Party Products is at your
              own risk and expense and subject to the terms and conditions of any such
              Third-Party Product. Prior to your use or access of any Third-Party
              Products, please carefully review the terms of conditions related to the
              Third-Party Product.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Intellectual Property Rights</Label>

            <Paragraph mt="x2">
              The Nouns Builder site at{' '}
              <Text
                as="a"
                href="https://nouns.build/"
                rel="noopner noreferrer"
                target="_blank"
                display="inline"
              >
                https://nouns.build/
              </Text>{' '}
              is hosted by Zora and its contents are our proprietary property and content.
              However, the underlying source code repository for the Interface is open
              source and available at{' '}
              <Text
                as="a"
                href="https://github.com/ourzora/nouns-builder"
                rel="noopner noreferrer"
                target="_blank"
                display="inline"
              >
                https://github.com/ourzora/nouns-builder
              </Text>
              . Provided that you are eligible to use the Interface, and subject to your
              compliance with these Terms, you are granted a limited, non-exclusive,
              non-transferable, non-sublicensable license to access and use the Interface.
            </Paragraph>

            <Paragraph mt="x2">
              For the avoidance of doubt, we do not have any ownership rights or control
              over the Protocol. All of the Protocol is completely open source. and such
              software is made available to you under the terms of the applicable
              licenses. Please review the applicable licenses for the Protocol here.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>No Legal or Financial Advice</Label>

            <Paragraph mt="x2">
              Nothing in the Interface or Protocol or otherwise provided by Zora, or the
              developers or contributors to the Interface or the Protocol, is intended to
              be legal or financial advice. Please consider consulting a lawyer and a
              financial advisor before proceeding, as creation and operation of a DAO may
              implicate tax, regulatory, and other considerations. By proceeding, you
              confirm that you have either received independent legal and financial advice
              on this issue, or that you understand the potential risks and have
              consciously chosen not to obtain such advice. You agree that you are solely
              and entirely responsible for compliance with all laws and regulations that
              may apply to you.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Prohibited Activity</Label>

            <Paragraph mt="x2">
              As a user of the Interface, you agree not to engage in, or attempt to engage
              in, any of the following categories of prohibited activity in relation to
              your access and use of the Interface:
            </Paragraph>

            <Box>
              <ol>
                <li>
                  <Box mt="x2">
                    <Text display="inline" mr="x1" italic fontWeight="display">
                      Intellectual Property Infringement.
                    </Text>
                    <Text display="inline">
                      Activity that infringes on or violates any copyright, trademark,
                      service mark, patent, right of publicity, right of privacy, or other
                      proprietary or intellectual property rights under the law.
                    </Text>
                  </Box>
                </li>

                <li>
                  <Box mt="x2">
                    <Text display="inline" mr="x1" italic fontWeight="display">
                      Cyberattack.
                    </Text>
                    <Text display="inline">
                      Activity that seeks to interfere with or compromise the integrity,
                      security, or proper functioning of any computer, server, network,
                      personal device, or other information technology system, including
                      (but not limited to) the deployment of viruses and denial of service
                      attacks. This also includes activity that circumvents, disables, or
                      otherwise interferes with security-related features of the
                      Interface.
                    </Text>
                  </Box>
                </li>

                <li>
                  <Box mt="x2">
                    <Text display="inline" mr="x1" italic fontWeight="display">
                      Fraud and Misrepresentation.
                    </Text>
                    <Text display="inline">
                      Activity that seeks to defraud us or any other person or entity,
                      including (but not limited to) providing any false, inaccurate, or
                      misleading information in order to unlawfully obtain the property of
                      another.
                    </Text>
                  </Box>
                </li>

                <li>
                  <Box mt="x2">
                    <Text display="inline" italic mr="x1" fontWeight="display">
                      Abuse.
                    </Text>
                    <Text display="inline">
                      Activity that uses the services to interact with the Protocol that
                      is intended to harass, abuse, intimidate or violate the legal rights
                      or privacy of any person.
                    </Text>
                  </Box>
                </li>

                <li>
                  <Box mt="x2">
                    <Text display="inline" italic mr="x1" fontWeight="display">
                      Any Other Unlawful Conduct.
                    </Text>
                    <Text display="inline">
                      Activity that violates any applicable law, rule, or regulation of
                      the United States or another relevant jurisdiction, including (but
                      not limited to) the restrictions and regulatory requirements imposed
                      by U.S. law.
                    </Text>
                  </Box>
                </li>
              </ol>
            </Box>
          </Box>

          <Box as="section" mt="x8">
            <Label>Third Party Materials</Label>

            <Paragraph mt="x2">
              The Interface may contain information from and links to third-party
              services, applications, Dapps, or resources (collectively “Third Party
              Materials”) and may enable you to access and connect to Dapps. We provide
              access to Third Party Materials only as a convenience to you and do not have
              control over their content, do not warrant or endorse, and are not
              responsible for the availability or legitimacy of the content, products, or
              services on or accessible from those Third Party Materials (including any
              related websites, resources, or links displayed therein). We make no
              warranties or representations, express or implied, about such Third Party
              Materials, the third parties they are owned and operated by, the information
              contained on them, or the suitability of their products and services. Use of
              any Third Party Materials is subject to any terms and conditions governing
              the Third Party Materials.
            </Paragraph>

            <Paragraph mt="x2">
              You acknowledge sole responsibility for and assume all risk arising from
              your use of any Third Party Materials. Third Party Materials, such as Dapps
              may provide access to assets which have high risks of illiquidity,
              devaluation, lockup, or loss. Zora shall not bear any liability, whatsoever,
              for any damage caused by any Third-Party Materials. You should use care in
              linking your DAO with any Third-Party Materials or otherwise providing any
              third-parties or Dapps with access to your DAO or DAO treasury.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Privacy</Label>

            <Paragraph mt="x2">
              <Text display="inline" mr="x1">
                We collect only a limited amount of information from you when you use the
                Interface, including your blockchain wallet address, device and connection
                information (including your browser type and operating system),
                performance data, and limited geographic data (which may include your IP
                address provided that IP addresses are only used to determine your general
                location when you connect your wallet, and are not otherwise stored). We
                may share device, connection, and performance information with third party
                service providers to address site performance and diagnostics, and resolve
                crashes and other errors. Please see our
              </Text>
              <Text
                as="a"
                href="https://support.zora.co/en/articles/6383373-zora-privacy-policy"
                rel="noopner noreferrer"
                target="_blank"
                display="inline"
                mr="x1"
              >
                Privacy Policy
              </Text>
              <Text display="inline">
                for additional information about our data collection and usage.
              </Text>
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Interface Modifications and Interruptions</Label>

            <Paragraph mt="x2">
              We reserve the right to change, modify, or remove the contents of the
              Interface at any time or for any reason at our sole discretion without
              notice. However, we have no obligation to update any information on the
              Interface. We also reserve the right to modify or discontinue all or part of
              the Interface without notice at any time. We will not be liable to you or
              any third party for any modification, suspension, or discontinuance of the
              Interface.
            </Paragraph>

            <Paragraph mt="x2">
              We cannot guarantee the Interface will be available at all times. We may
              experience hardware, software, or other problems or need to perform
              maintenance related to the Interface, resulting in interruptions, delays, or
              errors. We reserve the right to change, revise, update, suspend,
              discontinue, or otherwise modify the Interface at any time or for any reason
              without notice to you. You agree that we have no liability whatsoever for
              any loss, damage, or inconvenience caused by your inability to access or use
              the Interface during any downtime or discontinuance of the Interface.
              Nothing in these Terms will be construed to obligate us to maintain and
              support the Interface or to supply any corrections, updates, or releases in
              connection therewith.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>No Warranties</Label>

            <Paragraph mt="x2">
              THE INTERFACE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE
              FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ANY REPRESENTATIONS AND
              WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING
              (BUT NOT LIMITED TO) THE WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
              PARTICULAR PURPOSE. YOU ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE INTERFACE
              IS AT YOUR OWN RISK. WE DO NOT REPRESENT OR WARRANT THAT ACCESS TO THE
              INTERFACE WILL BE CONTINUOUS, UNINTERRUPTED, TIMELY, OR SECURE; THAT THE
              INFORMATION CONTAINED IN THE INTERFACE WILL BE ACCURATE, RELIABLE, COMPLETE,
              OR CURRENT; OR THAT THE INTERFACE WILL BE FREE FROM ERRORS, DEFECTS,
              VIRUSES, OR OTHER HARMFUL ELEMENTS. NO ADVICE, INFORMATION, OR STATEMENT
              THAT WE MAKE SHOULD BE TREATED AS CREATING ANY WARRANTY CONCERNING THE
              INTERFACE. WE DO NOT ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY
              ADVERTISEMENTS, OFFERS, OR STATEMENTS MADE BY THIRD PARTIES CONCERNING THE
              INTERFACE.The Interface is provided on an "AS IS" and "AS AVAILABLE" basis.
              TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ANY REPRESENTATIONS AND
              WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING
              (BUT NOT LIMITED TO) THE WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
              PARTICULAR PURPOSE. You acknowledge and agree that your use of the Interface
              is at your own risk. We do not represent or warrant that access to the
              Interface will be continuous, uninterrupted, timely, or secure; that the
              information contained in the Interface will be accurate, reliable, complete,
              or current; or that the Interface will be free from errors, defects,
              viruses, or other harmful elements. No advice, information, or statement
              that we make should be treated as creating any warranty concerning the
              Interface. We do not endorse, guarantee, or assume responsibility for any
              advertisements, offers, or statements made by third parties concerning the
              Interface.
            </Paragraph>

            <Paragraph mt="x2">
              We make no warranties or representations, express or implied, about linked
              ThirdParty Materials, the third parties they are owned and operated by, the
              information contained on them, assets available through them, or the
              suitability, privacy, or security of their products or services. You
              acknowledge sole responsibility for and assume all risk arising from your
              use of ThirdParty Materials, third party websites, applications, or
              resources, including risk of loss for assets traded through such third party
              services. We shall not be liable under any circumstances for damages arising
              out of or in any way related to software, products, services, and/or
              information offered or provided by third parties and accessed through the
              Interface including any Dapps.
            </Paragraph>

            <Paragraph mt="x2">
              Similarly, by interacting with the Protocol, you acknowledge that the
              Protocol is experimental and is provided on an “AS IS” and “AS AVAILABLE”
              basis without warranties of any kind. You acknowledge that the Protocol may
              not meet your requirements, may not be current or error-free, and that
              errors or defects may not be corrected, and that your use of the IProtocol
              is at your own risk. While we contributed to the initial code for the
              Protocol, we do not own or control the Protocol. Upgrades and modifications
              to the Protocol are managed by the Builder DAO community. We do not endorse,
              guarantee, or assume responsibility for any advertisements, offers, or
              statements made by third parties concerning the Protocol.
            </Paragraph>

            <Paragraph mt="x2">
              There are no guarantees that a Nouns-model DAO makes sense for your project,
              or that these tools will work exactly as intended. We encourage you to do
              your own research prior to utilizing the Interface to create and manage a
              Nouns-model DAO.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Limitation of Liability</Label>

            <Paragraph mt="x2">
              IN NO EVENT SHALL WE, ANY OF OUR OFFICERS, DIRECTORS, EMPLOYEES,
              CONTRACTORS, AGENTS, AFFILIATES, OR SUBSIDIARIES BE LIABLE TO YOU OR ANY
              RELATED PARTY FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL,
              EXEMPLARY, PUNITIVE, OR OTHER DAMAGES OF ANY KIND, INCLUDING DAMAGES FOR
              BUSINESS INTERRUPTION, LOSS OF USE, DATA BREACH, REVENUE OR PROFIT, COST OF
              CAPITAL, LOSS OF BUSINESS OPPORTUNITY, LOSS OF GOODWILL, OR FEDERAL, STATE,
              OR OTHER REGULATORY LIABILITY, REGARDLESS OF WHETHER SUCH DAMAGES WERE
              FORESEEABLE AND WHETHER OR NOT WE WERE ADVISED OF THE POSSIBILITY OF SUCH
              DAMAGES. IN NO EVENT SHALL OUR AGGREGATE LIABILITY TO YOU EXCEED THE TOTAL
              AMOUNT YOU PAID TO US TO ACCESS THE INTERFACE OR USD $100.00, WHICHEVER IS
              GREATER.
            </Paragraph>

            <Paragraph mt="x2">
              IN NO EVENT SHALL BUILDER DAO, OR ANY DEVELOPERS, ENTITIES OR CONTRIBUTORS
              TO THE CREATION OR MAINTENANCE OF THE PROTOCOL BE LIABLE TO YOU OR ANY
              RELATED PARTY FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL,
              EXEMPLARY, PUNITIVE, OR OTHER DAMAGES OF ANY KIND, INCLUDING DAMAGES FOR
              BUSINESS INTERRUPTION, LOSS OF USE, DATA BREACH, REVENUE OR PROFIT, COST OF
              CAPITAL, LOSS OF BUSINESS OPPORTUNITY, LOSS OF GOODWILL, OR FEDERAL, STATE,
              OR OTHER REGULATORY LIABILITY, REGARDLESS OF WHETHER SUCH DAMAGES WERE
              FORESEEABLE AND WHETHER BUILDER DAO, OR PARTIES CONTRIBUTING TO THE
              DEVELOPMENT OF THE PROTOCOL WERE ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </Paragraph>

            <Paragraph mt="x2">
              Some jurisdictions do not allow the exclusion of certain warranties or the
              limitation or exclusion of certain liabilities and damages. Accordingly,
              some of the disclaimers and limitations set forth in this Agreement may not
              apply to you. This limitation of liability shall apply to the fullest extent
              permitted by law.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Governing Law</Label>

            <Paragraph mt="x2">
              These Terms and your use of the Interface are governed by and construed in
              accordance with the laws of the State of California applicable to agreements
              made and to be entirely performed within the State of California, without
              regard to its conflict of law principles.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Dispute Resolution</Label>

            <Paragraph mt="x2">
              <Text display="inline" mr="x1">
                We will use our best efforts to resolve any potential disputes through
                informal, good faith negotiations. If a potential dispute arises, you must
                contact us by sending an email to
              </Text>
              <Text display="inline" as="a" href="mailto:support@zora.co" mr="x1">
                support@zora.co
              </Text>
              <Text display="inline">
                so that we can attempt to resolve it without resorting to formal dispute
                resolution. If we aren't able to reach an informal resolution within sixty
                days of your email, then you and we both agree to resolve the potential
                dispute according to the process set forth below
              </Text>
            </Paragraph>

            <Paragraph mt="x2">
              Any claim or controversy arising out of or relating to the Interface, these
              Terms, or any other acts or omissions for which you may contend that we are
              liable, including (but not limited to) any claim or controversy as to
              arbitrability ("Dispute"), shall be finally and exclusively settled by
              arbitration under the Commercial Arbitration Rules of the American
              Arbitration Association ("AAA") and, where appropriate, the AAA’s
              Supplementary Procedures for Consumer Related Disputes ("AAA Consumer
              Rules"), both of which are available at the AAA website: www.adr.org. You
              understand that you are required to resolve all Disputes by binding
              arbitration. The arbitration shall be held on a confidential basis before a
              single arbitrator, who shall be selected pursuant to the AAA Consumer Rules
              and, where appropriate, limited by the AAA Consumer Rules. The arbitration
              will be held in San Francisco, California unless you and we both agree to
              hold it elsewhere. Unless we agree otherwise, the arbitrator may not
              consolidate your claims with those of any other party. Any judgment on the
              award rendered by the arbitrator may be entered in any court of competent
              jurisdiction.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Class Action and Jury Trial Waiver</Label>

            <Paragraph mt="x2">
              All Disputes against us must be brought in your individual capacity and not
              as a plaintiff in or member of any purported class action, collective
              action, private attorney general action, or other representative proceeding.
              This provision applies to class arbitration. You and we both agree to waive
              the right to demand a trial by jury.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Miscellaneous</Label>

            <Paragraph mt="x2">
              These Terms and any policies or operating rules posted by us on the
              Interface or in respect to the Interface constitute the entire agreement and
              understanding between you and us. Our failure to exercise or enforce any
              right or provision of these Terms shall not operate as a waiver of such
              right or provision. These Terms operate to the fullest extent permissible by
              law. We may assign any or all of our rights and obligations to others at any
              time. We shall not be responsible or liable for any loss, damage, delay, or
              failure to act caused by any cause beyond our reasonable control. If any
              provision or part of a provision of these Terms is determined to be
              unlawful, void, or unenforceable, that provision or part of the provision is
              deemed severable from these Terms and does not affect the validity and
              enforceability of any remaining provisions. There is no joint venture,
              partnership, employment or agency relationship created between you and us as
              a result of these Terms or use of the Interface. You agree that these Terms
              will not be construed against us by virtue of having drafted them. You
              hereby waive any and all defenses you may have based on the electronic form
              of these Terms and the lack of signing by the parties hereto to execute
              these Terms.
            </Paragraph>
          </Box>
        </Box>
      </main>
    </>
  )
}

LegalPage.getLayout = getDefaultLayout

export default LegalPage
