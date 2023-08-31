# What does this tool do?
It helps format a DNA metabarcoding dataset (OTU table style) to be published on GBIF.org without the user having to learn Darwin Core terms and know a lot about data standardisation and reformating.

# Who can use the tool?
Currently, GBIF is deveopling and testing the tool internally, but it will be opened to a wider audience later. Anybody can provide datasets for the test phase, and these datasets may be published to GBIF.org if the data holder wishes. See more [here](https://edna-tool.gbif-uat.org/templates/edna_template.xlsx)
    
# What kind of data can be published/submitted using this tool?
This tool processes an OTU table so the data can be published to GBIF.org. With an OTU table we think if a table containing some sequences (ASVs/OTUs) and their sequence abundance in a set of samples. This would be the result of the PCR amplification of DNA extracted from a sample and sequenced on a high throughput seqeuncing platform like Illumina MiSeq.

    
# What kind of samples are acceptable to publish on GBIF.org?
All relatively fresh environmental samples (soil, air, water, dust, etc) as well as bulk samples of small organisms (e.g. from malaise trap) are acceptable. Heavily manipulated/treated environmental samples may not reflect real biodiversity and deemed as irrelevant from a biodiversity perspective. Use your judgement.

    
# Which markers/barcodes (COI, ITS, 16S,..) does GBIF and the tool support?
It is possible to publish data based on amplification and sequencing of any amplified barcoding region. The intention is to be able to re-interpret the taxonomy of sequences to reflect improved reference databases, and make data maximally interoperable with similar datasets and biodiversity data from other sources/techniques. This process will likely start with ITS, CO1 and 16S, but this is not yet implemented. 
    
    
# Should sequences be trimmed?
Primers, adapters and tags, etc should always be removed from sequences. If you have trimmed your sequences further (e.g. trimming away the end of 5.8S and start of 28S from ITS2 data), then that is also acceptable, but not a requiment.
    
    
# Should sequences be clustered into OTUs?
Identical sequences should be collapsed, and futher clustering, denoising and compression may be relevant depending of sequencing platform and bioinformatic tools used. If using e.g. the Illumina MiSeq platform, we recommend sharing unclustered amplicon sequence variants (ASVs). This approach keeps the data maximally interoperable with data from other studies – compared to clusting into broader (e.g. 97% culstering) OTUs, where centroids of almost similar OTUs may be picked differently between datasets and algorithms.
    
    
# Should sequence abundances be converted to relative abundances?
No. GBIF recommends to share detected absolute abundances (number of reads of the ASV/OTU in you sample). The tool will automatically calculate total number of reads per sample and relative abundances, so that future users have the option to filter on both absolute and relative abundances.
    
    
# Should samples be resampled/rarefied to even sequencing depth?
No. When doing metabarcoding, researchers are often resampling the OTU tables to achieve even sequencing depth (same total number of reads per sample) to standardise sampling effort across samples. GBIF recommends to share detected absolute abundances (number of reads per ASV/OTU in each sample). The tool will automatically calculate total number of reads per sample and relative abundances, so that future users have the option to filter on both absolute and relative abundances. Users downloading whole datasets will be able to do this resampling themselves if they wish.
    
    
# Should negative controls, positive controls, blanks and failed samples be removed from the dataset?
Yes. Only share data from real environmental samples producing data that seems trustworthy should be shared.   
    
    
# Should I remove singletons, infrequent or low abundant sequences?
No. There may be a good reason to remove low abundant sequences, singletons, infrequent sequences in some studies. But GBIF does not recommend or enforce any default removal of singletons, infrequent og low abundant sequences.
    
    
# Should data from replicates be merged?
Maybe. Do whatever makes the data most suitable for reuse in biodiversity studies. If replication (DNA extractions, PCRs) was used to reduce stochasticity, then merging of replicates may be the best choice.
    
    
# What if there are several versions of an OTU table?
Only one verison of the OTU table should be shared. Sometimes several version of an OTU table exist - e.g. clustered at different thresholds, removed non-target species and suspected contaminants - or split it into several tables with different taxonomic scopes. GBIF recommends to share the most inclusive version, including everything detected.
    
    
# Should data from suspected contaminants be removed?
Yes. Some sequences/OTUs may be sustepcted contamination as e.g. DNA from human and classical food items (tomato, potato, chicken, etc.) is often amplified and sequenced along with the DNA from an environmental sample. We recommend to remove these if they can be identified.
    
    
# Should non-target sequences be removed?
No, but it is ok if it has been done. Some sequences/OTUs are perceived as non-target sequences - e.g. if mammals are detected in a study using fish-specific primers. However, most of those non-target sequences may still be biodiversity relevant data seen in a larger perspective. Also, such custom filterings of data may actually make the data less compatible with similar datasets produced with the same primers. So, GBIF does generally encourage not to remove non-target sequences, unless they are obviously contaminations or otherwise untrustworthy.
    
    
# Should taxonomy be assigned to sequences?
Not necessarily. Currently GBIF identifies/indexes  data based on the taxonomy you provide. If only the sequence is provided, the inferred occurrences will be stored under the label incertae sedis for now. However the presence of the sequence will make it possible to assign taxonomy at a later stage. GBIF aims to provide the possibility of automatic updating of sequence based identification (see above). The tool currently also allows assigning of taxonomy for 16S, ITS and COI data. 
    
    
# How should taxonomy be assigned to sequences?
There exist many reference databases and tools for assigning taxonomy to sequences, and reference databases are continuously improved and changed. GBIF does not recommend any particular tool or pipeline. Use what is appropriate for the data. GBIF provides a sequence annotation tool for some markers. You can use that if you wish. In the long term GBIF aims to continuously reannotate sequence based data to ensure that consistency across datasets and time. GBIF will however keep original taxonomic identifications provided by the user to ensure traceability.
    
    
# How should I provide the taxonomic information when I submit my OTU data to GBIF?
xxxxxx
    
    
# Should I share sequences that cannot be taxonomically identified.
Yes, definetely. By default all OTUs/ASVs should be shared. Sequences that cannot be taxonomically identified generally reflect the fact that reference databases are incomplete. However, as reference databases are continuously improved, at least some of the unidentified sequences will eventually be possible to identify. So please provide all sequences.
    
    
# Will GBIF make sure that the taxonomy is updated?
Hopefully yes. For many barcoding regions and taxonomic groups, reference databases are incomplete and partially incorrect, but are continuously improved. Thus, taxonomic identifications based on comparison with reference databases, often reflect the current state of the database used. In the long term GBIF aims to continuously reannotate sequence based data to ensure consistency across datasets and time. GBIF will keep original taxonomic identifications provided by the user to ensure traceability. 
    
    
# How does GBIF ensure fitness for reuse and interoperability of data?
In the long term GBIF aims to continuously re-annotate sequence based data to ensure consistency across datasets and time. GBIF will however keep original taxonomic identifications provided by the user to ensure traceability. GBIF is also working on better tools for searching for and filtering of sequence based data.
    
    
# Can the tool be used to just to make a Darwin Core archive?
Yes. The tool can be used to produce a Darwin Core archive. This darwin core archive can then be published to GBIF, OBIS or another research infrastructure through another publishing process.
    
    
# Can the tool be used to just to make a BIOM file?
Yes. The tool may be used to construct a standardised BIOM file of data, that can be downloaded for any other purpose.
    
    
# Should/can data from several primers/markers be combined in one table?
No. Dna from the same set of samples may have amplified and sequenced with several different primer sets (e.g. COI, ITS, 16S). These should be treated as different datasets (one dataset per marker), and each dataset should be published separately. The same sample metadata file may of course be (re-)used together with the different OTU tables.
    
    
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
