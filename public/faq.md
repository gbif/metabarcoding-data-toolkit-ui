# What does this tool do?
It helps you to easily format an DNA metabarcoding dataset to be published on GBIF.org. [more promotion here]
    
# What kind of data can I publish/submit using this tool?
This tool processes an \OTU table\ so they can be published to GBIF.org. With an OTU table we think if a table containing some sequences (ASVs/OTUs) and their sequence abundance in a set of samples. This would be the result of the PCR amplification of DNA extracted from a sample and sequences on a HTS
    
    
# What kind of samples are acceptable?
all relatively fresh environmental samples (soil, air, water, dust, etc) as well as bulk samples of small organisms (e.g. from malaise trap) are acceptable. Heavily manipulated/treated environmental samples may not reflecting \real biodiversity\ and deemed as irrelevant from a biodiversity perspective. Use your judgement.
    
    
# Which markers (COI, ITS, 16S,..) do you support?
You can publish data based on amplification and sequencing of any marker regions. The intention is to be able to continuously re-interpret the taxonomic affiliation of all sequences to reflect the current status of reference databases, and make data maximally interoperable with similar datasets and biodiversity data from other sources/techniques. This process will likely start with ITS, CO1 and 16S, but this is not yet implemented. 
    
    
# Should I trim my sequences?
You should alway remove the primers, adapters and tags, etc from your sequences. GBIF does not have any requirements for further trimming. If you have trimmed your sequences further (e.g. trimming away the end of 5.8S and start of 28S from ITS2 data), then that is also acceptable.
    
    
# Should I cluster my sequences into OTUs?
GBIF recommends that you share unclustered amplicon sequences (ASVs/ESVs). That keeps the data maximally compatible with data from other studies (as centroids of identical OTUs may be picked differently between datasets and algorithms).
    
    
# Should I convert sequence abundances to relative abundances?
No. GBIF recommends to share your detected absolute abundances (number of reads of the OTU in you sample). The tool will automatically calculate total number of reads per sample and relative abundances, so that future users have the option to filter on both absolute and relative abundances.
    
    
# Should I resample/rarefy my dataset to even sequencing depth?
No. When doing metabarcoding, researchers are often resampling the OTU tables to achieve even sequencing depth (total number of reads per sample) to standardise \sampling effort\ of all samples in a dataset. GBIF recommends to share your detected absolute abundances (number of reads of the OTU in you sample). The tool will automatically calculate total number of reads per sample and relative abundances, so that future users have the option to filter on both absolute and relative abundances. Users downloading your whole dataset will be able to do this resampling themselves if they wish.
    
    
# Should I remove negative controls, positive controls, blanks and failed samples?
Yes. You should only share data from real environmental samples, that produced data that seem trustworthy.   
    
    
# Should I remove singletons, infrequent or low abundant sequences?
No. However, you may have good reasons to remove low abundant sequences, singletons, infrequent sequences for you specific study. But GBIF does not recommend or enforce any default removal of singletons, infrequent og low abundant sequences.
    
    
# Should I merge replicates?
Maybe. Do what you think makes your data best re-usable for biodiversity studies. If you did replicates (DNA extractions, PCRs) to reduce stochastic detection of samples, then it seems logical that you merge your replicates.
    
    
# What do I do if I have several versions of my OTU table?
You should only share one version of your OTU table. You may have produced several version of your OTU table - e.g. clustered at different thresholds, removed non-target species and suspected contaminants - or split it into several tables with different taxonomic scopes. GBIF recommends to share the most inclusive table and preferably
    
    
# Should I remove suspected contamination?
Yes. You may consider some of your sequences/OTUs as contamination - e.g. DNA from human and classical food items (tomato, potato, chicken, etc.) is often amplified and sequenced along with the DNA from an environmental sample. GBIF encourages you to remove these if they can be identified, but does not require such filtering.
    
    
# Should I remove non-target sequences?
No, but you can. You may consider some of your sequences/OTUs as non-target sequences - e.g. you are using fish-specific primers but still amplify and sequence dna from mammals. However, most of those non-target sequences may still be biodiversity relevant data seen in a larger perspective. Also, such custom filterings of data may actually make the data less compatible with similar datasets produced with the same primers. So, GBIF does generally encourage not to remove non-target sequences, unless they obviously are contaminations, or otherwise untrustworthy.
    
    
# Should I assign taxonomy to my sequences?
Yes, but not necessarily. GBIF identifies/indexes your data based on the taxonomic id's you provide. If you only provide the sequence, the inferred occurrences will be stored under the label \incertae sedis\. However the presence of the sequence will make it possible to assign taxonomy at a later stage. GBIF aims to provide the possibility of automatic updating of sequence based identification. 
    
    
# How should I assign taxonomy to my sequences?
There exist many reference databases and tools for assigning taxonomy to sequences, and reference databases are continuously improved and changed. GBIF does not recommend any particular tool or pipeline. Use what you think is appropriate for your data. GBIF provides a sequence annotation tool for some markers. You can use that if you wish. In the long term GBIF aims to continuously reannotate sequence based data to ensure that consistency across datasets and time. GBIF will however keep original taxonomic identifications provided by the user to ensure traceability.
    
    
# How should I provide the taxonomic information when I submit my OTU data to GBIF?
xxxxxx
    
    
# Should I share sequences that cannot be taxonomically identified.
Yes. Sequences that cannot be taxonomically identified just reflect the fact that reference databases are incomplete. However, as reference databases are continuously improved, at least some of your unidentified sequences will eventually be possible to identify. So please provide all sequences.
    
    
# Will GBIF make sure that the taxonomy is updated?
Hopefully yes. For many barcoding regions and taxonomic groups, reference databases are incomplete and partially incorrect, but are continuously improved. Thus, taxonomic identifications based on comparison with reference databases, often reflect the current state of the database used. In the long term GBIF aims to continuously reannotate sequence based data to ensure consistency across datasets and time. GBIF will keep original taxonomic identifications provided by the user to ensure traceability. 
    
    
# How does GBIF ensure fitness for reuse and interoperability of my data?
In the long term GBIF aims to continuously re-annotate sequence based data to ensure consistency across datasets and time. GBIF will however keep original taxonomic identifications provided by the user to ensure traceability. GBIF is also working on better tools for searching for and filtering of sequence based data.
    
    
# Can I use the tool just to make a Darwin Core archive?
Yes. If you wish to use the tool to produce a Darwin Core archive that is perfectly possible. This darwin core archive can then be published to GBIF, OBIS or another research infrastructure through another publishing process.
    
    
# Can I use the tool just to make a BIOM file?
Yes. You may use the tool to construct a standardised BIOM file of your data, and download that for any other use you see fit.
    
    
# Should I combine data from several primers/markers in one table?
No. You may have amplified and sequenced dna from the same set of samples with several different primer sets (e.g. COI, ITS, 16S). These should be treated as different datasets, and you should submit OTU data from each marker separately. You may of course use the same sample metadata file together with the different OTU tables.
    
    
# How can I update my dataset?
xxxxxx
    
    
# How can I correct errors in my dataset?
xxxxxx
    
    
# I have already submitted my raw sequences to INSDC (ENA, SRA, ...). Why should I also submit my data to GBIF.org?

xxxxxx
    
    
# Why should I use this tool?
xxxxxx
    
    
# Who should/can use this tool?
xxxxxx