import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';

import styles from './styles.module.scss';

export default function Header() {
    const currentDate = new Date().toLocaleDateString();

    return (
        <header className={styles.headerContainer}>
            <img src="/logo.svg" alt="Podcastr logo"/>
            <p>The best for you to hear, always</p>
            <span>Qui, 8 Abril</span>
        </header>
    );
}