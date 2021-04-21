import { GetStaticProps } from 'next';
import { format, parseISO} from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { api } from '../services/api';
import { ConvertDurationToTimeString } from '../utils/Date';

type Episode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  duration: number;
  durationAsString: string;
  url: string;
}

type HomeProps = {
  episodes: Episode[];
}

export default function Home(props: HomeProps) {

  //   SPA (React)
  // useEffect(() => {
  //   fetch('http://localhost:3333/episodes').then(res => res.json()).then(data => console.log(data));
  // }, [])

  return (
    <>
      <h1>Index pages</h1>
      <p>R: {JSON.stringify( props.episodes)}</p>
    </>
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
      description: ep.description,
      url: ep.file.url
    }
  })
  
  return {
    props: {
      episodes
    },
    revalidate: 60 * 60 * 8, //Time in seconds for refresh this page
  }
}