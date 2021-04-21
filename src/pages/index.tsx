//SSG
// import {useEffect} from 'react'

export default function Home(props) {

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
export async function getStaticProps() {
  const response = await fetch('http://localhost:3333/episodes');
  const data = await response.json();
  
  return {
    props: {
      episodes: data
    },
    revalidate: 60 * 60 * 8, //Time in seconds for refresh this page
  }
}