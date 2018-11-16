#!/bin/bash

# docker logs 5bd1f97df102 > upbeat_hugle_5bd1f97df102.log
# docker logs 3157d66a2df2 > peaceful_zhukovsky_3157d66a2df2.log
# docker logs 66187e23d188 > eloquent_lederberg_66187e23d188.log
# docker logs 275d2334f194 > flamboyant_mayer_275d2334f194.log
# docker logs a59fc1a5d57c > angry_lewin_a59fc1a5d57c.log

docker logs 5bd1f97df102 > upbeat_hugle_5bd1f97df102.log 2>&1
docker logs 3157d66a2df2 > peaceful_zhukovsky_3157d66a2df2.log 2>&1
docker logs 66187e23d188 > eloquent_lederberg_66187e23d188.log 2>&1
docker logs 275d2334f194 > flamboyant_mayer_275d2334f194.log 2>&1
docker logs a59fc1a5d57c > angry_lewin_a59fc1a5d57c.log 2>&1
