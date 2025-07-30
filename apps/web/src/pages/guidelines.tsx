import { Box, Heading, Label, Paragraph, Text } from '@buildeross/zord'
import Head from 'next/head'
import React from 'react'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { guidelinesContainer } from 'src/styles/guidelines.css'

import { NextPageWithLayout } from './_app'

const GuidelinesPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Nouns Builder | Proposal Guidelines</title>
      </Head>

      <main>
        <Box as="article" py="x8" className={guidelinesContainer}>
          <header>
            <Box>
              <Heading size="sm" mb="x2">
                Proposal Best Practices for DAOs
              </Heading>

              <Text>Last Updated: June 20, 2023</Text>
            </Box>
          </header>

          <Box as="section" mt="x4">
            <Paragraph>
              <Text display="inline">
                This document serves as suggested guidelines to help your DAO members have
                enough information and context on proposals to make an educated decision.
              </Text>
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Descriptive Title</Label>

            <Paragraph mt="x2">
              A brief but descriptive title that summarizes the heart of the proposal.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Summary</Label>

            <Paragraph mt="x2">
              What are the key asks of the proposal? What do you intend to build? This
              should be brief - 1-2 sentences.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Issue/Context (Optional but helpful)</Label>

            <Paragraph mt="x2">
              The context in which you are asking for the funding. Is there a problem you
              are solving or a specific reason for the ask? If the proposal is a follow-up
              to a prior proposal or DAO action, please include that history.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Proposal (The Ask)</Label>

            <Paragraph mt="x2">
              What are you asking for and how will you tackle the execution? This ought to
              be sufficiently detailed so voters understand what specifically is being
              requested, for what purpose, and what actions will be taken to achieve the
              stated purpose.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>North Star Check</Label>

            <Paragraph mt="x2">
              How does your proposal further the mission/vision of the DAO or the call for
              proposals?
            </Paragraph>

            <Paragraph mt="x2">
              How will DAO resources being requested be utilized in furtherance of the
              DAO’s mission? There should be clear alignment between the resources being
              requested/actions being taken and the DAO’s mission/vision.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Accountability</Label>

            <Box>
              <ul>
                <li>
                  <Box mt="x2">
                    <Text display="inline">
                      If funds are being requested, how is the funding going to be spent?
                      Provide a somewhat detailed budget.
                    </Text>
                  </Box>
                </li>
                <li>
                  <Box mt="x2">
                    <Text display="inline">
                      How long do you estimate it will take to complete the proposal:
                      Provide a timeline.
                    </Text>
                  </Box>
                </li>

                <li>
                  <Box mt="x2">
                    <Text display="inline">
                      What does success look like? What are the goals or end result of the
                      proposal? This should include specific, quantifiable metrics where
                      possible so, in review, the DAO can judge whether objectives were
                      met, especially where further funding or support is requested.
                    </Text>
                  </Box>
                </li>
                <li>
                  <Box mt="x2">
                    <Text display="inline">
                      Are you willing to provide ongoing status updates or spend time with
                      members that ask questions? Such commitments are strongly encouraged
                      to demonstrate respect and good faith to your fellow members.
                    </Text>
                  </Box>
                </li>
              </ul>
            </Box>
          </Box>

          <Box as="section" mt="x8">
            <Label>Treasury Impact</Label>

            <Paragraph mt="x2">
              The treasury impact should summarize the total amount being requested as
              well as provide DAO members the total percentage of funds being requested
              from the treasury providing the funding. The impact should be denominated in
              ETH so the proposer does not need to account for ETH/USD price adjustments.
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Transparency</Label>

            <Paragraph mt="x2">
              <Text display="inline" mr="x1">
                Include any potential conflicts of interest or other disclosures.
              </Text>
            </Paragraph>

            <Box>
              <ul>
                <li>
                  <Box mt="x2">
                    <Text display="inline">
                      Example: I am requesting funding for the company I founded to do X,
                      I may be personally enriched by receiving funds.
                    </Text>
                  </Box>
                </li>
                <li>
                  <Box mt="x2">
                    <Text display="inline">
                      Example: I have a personal relationship (we’re married) with the
                      Community Lead of the DAO.
                    </Text>
                  </Box>
                </li>

                <Paragraph mt="x2">
                  Include any prior funding given to the team or entity by the DAO (link
                  out to proposals) and summarize the outcome. Was it successful? Did it
                  take longer than anticipated?
                </Paragraph>
              </ul>
            </Box>
          </Box>

          <Box as="section" mt="x8">
            <Label>Author</Label>

            <Paragraph mt="x2">Who are the authors of the proposal?</Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Tax Information</Label>

            <Paragraph mt="x2">
              Who will be the responsible party for tax reporting?
            </Paragraph>
          </Box>

          <Box as="section" mt="x8">
            <Label>Optional (but helpful)</Label>

            <Paragraph mt="x2">
              Are you an accomplished builder in the web3 ecosystem? Sharing bio blurbs
              and other successfully executed projects can help let members know that you
              have the talent and ability to execute your vision.
            </Paragraph>
          </Box>
        </Box>
      </main>
    </>
  )
}

GuidelinesPage.getLayout = getDefaultLayout

export default GuidelinesPage
