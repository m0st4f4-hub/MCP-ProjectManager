'use client';

import React from 'react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import styles from './DetailsContent.module.css';
import { clsx } from 'clsx';

const DetailsContent: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.mainHeading}>Detailed Views</h1>
            <div className={styles.contentVStack}>
                <div className={styles.subheadingHStack}>
                    <InfoOutlineIcon className={styles.infoIcon} />
                    <h2 className={styles.subHeading}>What Details Would You Like to See?</h2>
                </div>
                <p className={styles.secondaryText}>
                    This section is intended for displaying detailed information about specific items 
                    (e.g., a particular task, project, or agent performance metrics).
                </p>
                <p className={styles.tertiaryText}>
                    To make this section functional, please specify what kind of details you envision here. 
                    For example, should it show:
                </p>
                <ul className={styles.definitionList}>
                    <li className={styles.definitionListItem}>A detailed breakdown of a selected task, including its history and sub-tasks?</li>
                    <li className={styles.definitionListItem}>Comprehensive information about a selected project, including all its tasks and progress?</li>
                    <li className={styles.definitionListItem}>In-depth statistics for a specific agent?</li>
                    <li className={styles.definitionListItem}>Or perhaps a general reporting dashboard with customizable detail views?</li>
                </ul>
                <p className={clsx(styles.secondaryText, styles.marginTop3)}>
                    Once the purpose is clarified, this component can be built out to fetch and display the relevant data.
                </p>
            </div>
        </div>
    );
};

export default DetailsContent;
