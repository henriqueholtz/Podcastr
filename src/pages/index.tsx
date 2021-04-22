import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link'
import { format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { ConvertDurationToTimeString } from '../utils/Date';

import styles from './home.module.scss';
import { PlayerContext } from '../contexts/PlayerContext';
import { useContext } from 'react';

type Episode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const player = useContext(PlayerContext);

  //   SPA (React)
  // useEffect(() => {
  //   fetch('http://localhost:3333/episodes').then(res => res.json()).then(data => console.log(data));
  // }, [])

  return (
    <div className={styles.homePage}>
      <section className={styles.latestEpisodes}>
        <h2>Last Releases {player}</h2>

        <ul>
          {latestEpisodes.map(ep => {
            return (
              <li key={ep.id}>
                <Image width={192} height={192} src={ep.thumbnail} alt={ep.title} objectFit="cover"/>

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${ep.id}`}>
                    <a>{ep.title}</a>
                  </Link>
                  <p>{ep.members}</p>
                  <span>{ep.publishedAt}</span>
                  <span>{ep.durationAsString}</span>
                </div>

                <button type="button">
                  <img src="/play-green.svg" alt="Play episode"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>All episodes</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Members</th>
              <th>Date</th>
              <th>Duration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map(ep => {
              return (
                <tr key={ep.id}>
                  <td style={{ width: 100 }}>
                    <Image width={120} height={120} src={ep.thumbnail} alt={ep.title} objectFit="cover"/>
                  </td>
                  <td>
                    <Link href={`/episodes/${ep.id}`}>
                      <a>{ep.title}</a>
                    </Link>
                  </td>
                  <td>{ep.members}</td>
                  <td style={{ width: 100 }}>{ep.publishedAt}</td>
                  <td>{ep.durationAsString}</td>
                  <td>
                    <button type="button">
                      <img src="/play-green.svg" alt="Play episode" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

//SSR
// export async function getServerSideProps() {
//   const response = await fetch('http://localhost:3333/episodes');
//   const data = await response.json();
  
//   return {
//     props: {
//       episodes: data
//     }
//   }
// }

//SSG - only works in production (generating a build)
export const getStaticProps: GetStaticProps = async () => {
  const {data} = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map(ep => {
    return {
      id: ep.id,
      title: ep.title,
      thumbnail: ep.thumbnail,
      members: ep.members,
      publishedAt: format(parseISO(ep.published_at), 'd MMM yy', {
        locale: ptBR
      }),
      duration: Number(ep.file.duration),
      durationAsString: ConvertDurationToTimeString(Number(ep.file.duration)),
      url: ep.file.url
    }
  })

  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length)
  
  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8, //Time in seconds for refresh this page
  }
}