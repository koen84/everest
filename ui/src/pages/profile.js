/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { navigate } from 'gatsby'
import ThreeBox from '3box'
import queryString from 'query-string'
import { isMobile } from 'react-device-detect'

import { useAccount } from '../utils/hooks'
import { metamaskAccountChange } from '../services/ethers'
import { convertDate } from '../utils/helpers/date'
import { PROFILE_QUERY } from '../utils/apollo/queries'
import { ORDER_BY, ORDER_DIRECTION } from '../utils/constants'

import Divider from '../components/Divider'
import Button from '../components/Button'
import Section from '../components/Section'
import Switcher from '../components/Switcher'
import Sorting from '../components/Sorting'
import DataRow from '../components/DataRow'
import Menu from '../components/Menu'
import Link from '../components/Link'
import ProfilePlaceholder from '../images/profile-placeholder.svg'

const Profile = ({ location }) => {
  const { account } = useAccount()
  const [selectedProjectsView, setSelectedProjectsView] = useState('cards')
  const [selectedChallengesView, setSelectedChallengesView] = useState('cards')
  const [selectedDelegatorView, setSelectedDelegatorView] = useState('cards')
  const [profile, setProfile] = useState(null)
  const [selectedOrderBy, setSelectedOrderBy] = useState(ORDER_BY['Name'])
  const [selectedOrderDirection, setSelectedOrderDirection] = useState(
    ORDER_DIRECTION.ASC,
  )
  const [isSortingOpen, setIsSortingOpen] = useState(false)

  const queryParams = location ? queryString.parse(location.search) : null

  const profileId = queryParams ? queryParams.id : null

  useEffect(() => {
    async function getProfile() {
      const threeBoxProfile = await ThreeBox.getProfile(account)
      let image
      if (threeBoxProfile.image && threeBoxProfile.image.length > 0) {
        image = `https://ipfs.infura.io/ipfs/${threeBoxProfile.image[0].contentUrl['/']}`
      } else {
        image = `${window.__GATSBY_IPFS_PATH_PREFIX__ ||
          ''}/profile-default.png`
      }
      const threeBoxAccounts = await ThreeBox.getVerifiedAccounts(
        threeBoxProfile,
      )
      if (threeBoxProfile && Object.keys(threeBoxProfile).length > 0) {
        setProfile(state => ({
          ...state,
          ...threeBoxProfile,
          image: image,
          accounts: threeBoxAccounts,
        }))
      } else {
        setProfile({ image: image })
      }
    }
    metamaskAccountChange(accounts => {
      if (accounts && accounts.length > 0) {
        navigate(`/profile?id=${accounts[0]}`)
      } else {
        navigate('/')
      }
    })
    if (account) {
      getProfile()
    }
  }, [account])

  const { error, data } = useQuery(PROFILE_QUERY, {
    variables: {
      id: profileId,
      orderBy: selectedOrderBy,
      orderDirection: selectedOrderDirection,
    },
  })

  if (error) {
    console.error('Error with Profile query: ', error)
    return <div />
  }

  const isOwner = () => account === profileId || account === profileId

  const user = data ? data.user : {}

  return (
    <Grid>
      <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
        <Grid
          sx={{
            gridTemplateColumns: ['1fr', '120px 1fr'],
            alignItems: 'center',
          }}
        >
          <Grid
            sx={
              isMobile
                ? {
                    gridTemplateColumns: 'max-content max-content',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }
                : {}
            }
          >
            {profile && profile.image ? (
              <img src={profile.image} alt="Profile" sx={profileImgStyles} />
            ) : (
              <ProfilePlaceholder sx={profileImgStyles} />
            )}
            {isOwner() && isMobile && (
              <Menu
                items={[
                  {
                    text: 'Edit (3Box)',
                    handleSelect: () => {
                      window.open(`https://3box.io/${account}`, '_blank')
                    },
                    icon: '/edit.png',
                  },
                ]}
              >
                <img
                  src={`${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/dots.png`}
                  sx={{
                    pt: 1,
                    pl: 2,
                    width: '24px',
                    transform: 'rotate(90deg)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  alt="dots"
                />
              </Menu>
            )}
          </Grid>
          {profile && profile.name ? (
            <Box>
              <Styled.h2>{profile.name}</Styled.h2>
              <Styled.p
                sx={{
                  fontSize: ['0.85rem', '0.85rem', '1rem'],
                  fontWeight: 'heading',
                  color: 'secondary',
                  mt: 1,
                }}
              >
                {profileId}
              </Styled.p>
            </Box>
          ) : (
            <Box>
              <Styled.h5 sx={{ fontSize: ['0.85rem', '1.25rem', '1.5rem'] }}>
                {profileId}
              </Styled.h5>
              {isOwner() && (
                <Link
                  onClick={() =>
                    window.open(`https://3box.io/${account}`, '_blank')
                  }
                  sx={{ fontWeight: 'heading', color: 'secondary', mt: 3 }}
                >
                  Edit/Create profile (3Box)
                </Link>
              )}
            </Box>
          )}
        </Grid>
        <Grid
          sx={{
            gridTemplateColumns:
              user && user.createdAt
                ? ['1fr 1fr', '1fr max-content']
                : ['max-content'],
            justifyContent: 'flex-end',
            textAlign: ['left', profile ? 'center' : 'right'],
          }}
          mt={[5, 5, 0]}
        >
          {user && user.createdAt && (
            <Box>
              <p sx={{ variant: 'text.small' }}>Member Since</p>
              <p sx={{ variant: 'text.huge' }}>
                {user ? convertDate(user.createdAt) : ''}
              </p>
            </Box>
          )}
          {isOwner() && !isMobile && (
            <Menu
              items={[
                {
                  text: 'Edit (3Box)',
                  handleSelect: () => {
                    window.open(`https://3box.io/${account}`, '_blank')
                  },
                  icon: '/edit.png',
                },
              ]}
            >
              <img
                src={`${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/dots.png`}
                sx={{
                  pt: 1,
                  pl: 2,
                  width: '24px',
                  transform: 'rotate(90deg)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                alt="dots"
              />
            </Menu>
          )}
        </Grid>
      </Grid>
      {profile && <Divider />}
      <Grid columns={[1, 1, 2]} gap={5}>
        <Box>
          {profile && profile.description && (
            <Styled.p>{profile.description}</Styled.p>
          )}
        </Box>
        {profile && (
          <Box>
            {profile && profile.website && (
              <DataRow
                name="Website"
                value={profile.website}
                href={profile.website}
              />
            )}
            {profile &&
              profile.accounts &&
              Object.keys(profile.accounts).length > 0 && (
                <Fragment>
                  {profile.accounts.twitter && (
                    <DataRow
                      name="Twitter"
                      value={`twitter.com/${profile.accounts.twitter.username}`}
                      href={`https://twitter.com/${profile.accounts.twitter.username}`}
                    />
                  )}
                  {profile.accounts && profile.accounts.github && (
                    <DataRow
                      name="Github"
                      value={`github.com/${profile.accounts.github.username}`}
                      href={`https://github.com/${profile.accounts.github.username}`}
                    />
                  )}
                </Fragment>
              )}
          </Box>
        )}
      </Grid>
      {user && user.projects && user.projects.length > 0 ? (
        <Fragment>
          <Grid columns={[1, 2, 2]} mb={1} mt={6}>
            <Box>
              {isOwner() ? (
                <Styled.h5>Your Projects</Styled.h5>
              ) : (
                <Styled.h5>Projects</Styled.h5>
              )}
              <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
                {user && user.projects && user.projects.length > 0 && (
                  <span>{user.projects.length} Projects</span>
                )}
              </Styled.p>
            </Box>
            <Grid
              sx={{
                gridTemplateColumns: '1fr max-content',
                alignItems: 'baseline',
              }}
            >
              <Sorting
                selectedOrderBy={selectedOrderBy}
                setSelectedOrderBy={setSelectedOrderBy}
                selectedOrderDirection={selectedOrderDirection}
                setSelectedOrderDirection={setSelectedOrderDirection}
                isSortingOpen={isSortingOpen}
                setIsSortingOpen={setIsSortingOpen}
              />
              <Switcher
                selected={selectedProjectsView}
                setSelected={setSelectedProjectsView}
              />
            </Grid>
          </Grid>
          <Section
            items={user.projects.map(project => {
              return {
                ...project,
                description: project.description.slice(0, 30) + '...',
                to: `/project/${project.id}`,
                image: project.avatar,
                pending: project.id.indexOf('0x') < 0,
                isChallenged: project.currentChallenge !== null,
                category:
                  project.categories.length > 0
                    ? project.categories[0].name
                    : '',
              }
            })}
            variant="project"
            selected={selectedProjectsView}
          />
        </Fragment>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <img
            src={`/mountain-empty.png`}
            sx={{ height: '190px', width: ['100%', 'auto', 'auto'] }}
          />
          <Divider sx={{ mt: '-6px !important' }} />
          {isOwner() ? (
            <Fragment>
              <Styled.h5 sx={{ mt: 7 }}>Your Projects</Styled.h5>
              <Styled.p sx={{ opacity: 0.64, mt: 3 }}>
                This is where you&apos;ll see projects you created
              </Styled.p>
              <Button
                text="Add a Project"
                to="/projects/new"
                variant="primary"
                sx={{ m: '0 auto', mt: 7 }}
              />
            </Fragment>
          ) : (
            <Fragment>
              <Styled.h5 sx={{ mt: 7 }}>Projects</Styled.h5>
              <Styled.p sx={{ opacity: 0.64, mt: 3 }}>
                This user has no projects
              </Styled.p>
            </Fragment>
          )}
        </Box>
      )}

      {user && user.delegatorProjects && user.delegatorProjects.length > 0 && (
        <Fragment>
          <Grid columns={[1, 2, 2]} mb={1} mt={6}>
            <Box>
              <Styled.h5>Delegated Projects</Styled.h5>
              <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
                <span>{user.delegatorProjects.length} Delegated Projects</span>
              </Styled.p>
            </Box>
            <Switcher
              selected={selectedDelegatorView}
              setSelected={setSelectedDelegatorView}
            />
          </Grid>
          <Section
            items={user.delegatorProjects.map(project => {
              return {
                ...project,
                description: project.description.slice(0, 30) + '...',
                to: `/project/${project.id}`,
                image: project.avatar,
                pending: project.id.indexOf('0x') < 0,
                isChallenged: project.currentChallenge !== null,
                category:
                  project.categories.length > 0
                    ? project.categories[0].name
                    : '',
              }
            })}
            variant="project"
            selected={selectedDelegatorView}
          />
        </Fragment>
      )}
    </Grid>
  )
}

const profileImgStyles = {
  height: '96px',
  width: '96px',
  borderRadius: '50%',
  objectFit: 'contain',
}

Profile.propTypes = {
  location: PropTypes.any,
}

export default Profile
